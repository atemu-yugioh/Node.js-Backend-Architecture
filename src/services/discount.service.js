/*
    Discount Service
    1 - Generate Discount Code [Shop | Admin]
    2 - Get All Product By Discount Code [User]
    3 - Get All Discount Code [User | Shop]
    4 - Get Discount Amount [User]
    5 - Delete Discount Code [Admin | Shop]
    6 - Cancel Discount Code [User]
*/

const { BadRequestError } = require("../core/error.response");
const discount = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
  checkExistDiscount,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class DiscountService {
  // 1 - Generate Discount Code [Shop | Admin]
  static async generateDiscountCode(payload) {
    const {
      code, // mã discount
      start_date, // ngày bắt đầu
      end_date, // ngày kết thúc
      is_active, // có đang được sử dụng không
      shopId, // shop nào
      min_order_value, // giá trị nhỏ nhất của đơn hàng để được áp dụng discount
      product_ids, // danh sách sản phảm được áp dụng discount
      applies_to, // áp dụng đến tất cả hay chỉ áp dụng 1 vài loại sản phẩm cụ thể
      name, // discount name
      description,
      type, // fixed_amount hay percentage
      value, // 100.000 vnd || 10%
      max_value, // mức giảm lớn nhất
      max_uses, // số lượng discount
      uses_count, // số lượng discount đã được dùng
      max_uses_per_user, // số lượng discount 1 user được phép sử dụng,
      users_used, // danh sách người đã dùng discount
    } = payload;

    // Nếu ngày bắt đầu hoặc ngày kết thúc nhỏ hơn ngày hôm nay => false
    if (
      new Date(start_date) <= new Date() ||
      new Date(end_date) <= new Date()
    ) {
      throw new BadRequestError("Time discount invalid!!");
    }

    // start_date > end_date => false
    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start day must before End day!!");
    }

    // existed
    const foundDiscount = await checkExistDiscount({
      model: discount,
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount has existed!!");
    }

    // create new discount
    const newDiscount = discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_max_value: max_value,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to == "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  // 2.  Get All Product By Discount Code [User] == get all product with discount code available (is_available == true)
  static async getAllProductByDiscountCode({
    code,
    shopId,
    userId,
    limit = 50,
    page = 1,
  }) {
    console.log(code, shopId);
    const foundDiscount = await checkExistDiscount({
      model: discount,
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    // not exist
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError("discount not exist!!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: shopId,
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get product by list id
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  // 3. Get all discount code by shop id
  static async getAllDiscountCodeOfShop({
    limit = 50,
    page = 1,
    sort = "ctime",
    shopId,
  }) {
    // lấy danh sách discount code của shop mà đang active
    const discounts = await findAllDiscountCodesUnSelect({
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unselect: ["__v", "discount_shopId"],
      limit: +limit,
      page: +page,
      sort: sort,
    });

    return discounts;
  }

  // 4. Get discount amount
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    // check exist discount
    const foundDiscount = await checkExistDiscount({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) {
      throw new BadRequestError("Discount not exist!!");
    }

    const {
      discount_is_active,
      discount_min_order_value, // giá tối thiểu của đơn hàng để áp dụng được discount
      discount_max_uses, // só lượng của discount này
      discount_users_used, // những ai đã sử dụng
      discount_value,
      discount_end_date,
      discount_max_uses_per_user,
      discount_type,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new BadRequestError("Discount Expired!!");
    }
    // kiểm tra xem số lượng discount hết chưa
    if (!discount_max_uses) {
      throw new BadRequestError("Discount are out!!");
    }

    // Nếu ngày hôm nay lớn hơn ngày hết hạn => false
    if (new Date() > new Date(discount_end_date)) {
      throw new BadRequestError("discount expired!!");
    }

    // kiểm tra xem có giá trị tối thiểu hay không
    let totalOrder = 0;
    if (discount_min_order_value) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `discount requires a minimum order value of ${discount_min_order_value}`
        );
      }
    }

    // kiểm tra xem người dùng đã sử dụng hết mã này chưa
    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.filter(
        (user) => user.userId === userId
      );

      if (userUseDiscount.length >= discount_max_uses_per_user) {
        throw new BadRequestError("you have expired to use the discount");
      }
    }

    // kiểm tra xem là loại fixed-amount hay percentage
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // 5. Delete discount
  static async deleteDiscountCode({ shopId, codeId }) {
    // ! có 3 cách xóa 1 item
    // ** Cách 1: Xóa mềm => không xóa mà chỉ update status (is_delete = true) (tốn thêm index để query)
    // ** Cách 2: Tạo 1 bảng history discount lưu lại => hoàn tác hoặc kiện cáo gì đó (Ưu tiên dùng cách này)
    // ** Cách 3: Xóa bay luôn => không có dữ liệu check lại => không làm cách này
    const foundDiscount = await checkExistDiscount({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount not exist!!");
    }
  }

  // 6. Cancel discount code
  static async cancelDiscountCode({ userId, shopId, codeId }) {
    const foundDiscount = await checkExistDiscount({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount not exist!!");
    }

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1, // số lượng discount
        discount_uses_count: -1, // số lượng discount đã sửa dụng
      },
    });

    return result;
  }
}

module.exports = DiscountService;
