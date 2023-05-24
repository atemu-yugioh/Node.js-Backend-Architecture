"use strict";

const { BadRequestError } = require("../core/error.response");
const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { deleteCartUser } = require("./cart.service");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  // login or without login
  /*
        {
            cartId
            userId
            shop_order_ids: [
                {
                    shopId
                    shop_discount:[]
                    item_products:[
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId
                    shop_discount:[
                        {
                            shopId
                            discountId
                            productId
                        }
                    ]
                    item_products:[
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cartId exist
    const foundCart = await findCartById(cartId);

    if (!foundCart) {
      throw new BadRequestError("Cart does not exist!!");
    }

    const checkoutOrder = {
      total_price: 0, // tổng tiền hàng
      free_ship: 0, // phí vận chuyển
      total_discount: 0, // tổng tiền giảm giá
      total_checkout: 0, // tổng thanh toán
    };

    const shop_order_ids_new = [];
    // tính tổng tiền bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discount = [],
        item_products = [],
      } = shop_order_ids[i];

      // check product available
      const checkProductServer = await checkProductByServer(item_products);
      console.log(`checkProductServer::`, checkProductServer);
      if (!checkProductServer[0]) throw new BadRequestError("order wrong!!!");

      // tổng tiền đơn hàng
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // tổng tiền đơn hàng trước khi được giảm giá
      checkoutOrder.total_price += checkoutPrice;

      // item shop_order_ids_new
      const itemCheckout = {
        shopId,
        shop_discount,
        item_products: checkProductServer, // list product của 1 shop
        priceRaw: checkoutPrice, // tiền trước khi giảm giá
        priceApplyDiscount: checkoutPrice, // mặc định là tiền trước khi giảm giá (kiểm tra nếu có discount sẽ update lại sau)
      };

      // nếu shop_discount tồn tại (có mã giảm giá), check hợp lệ hay không
      if (shop_discount.length > 0) {
        // giả sử chỉ có 1 discount để test
        // trên thực tế phải loop
        //get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discount[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        // tổng cộng discount giảm giá
        checkoutOrder.total_discount += discount;

        // nếu tiền giảm giá > 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // tổng thanh toán cuối cùng
      checkoutOrder.total_checkout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      checkout_order: checkoutOrder,
      shop_order_ids,
      shop_order_ids_new,
    };
  }

  // order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    // kiểm tra lại 1 lần nữa khi người dùng order
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    // check lại 1 lần nữa xem người dùng có vượt tồn kho không?
    // get new array product
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(`products::`, products);
    // kiểm tra mỗi product có vượt tồn kho không?
    const acquireProduct = []; // nếu có product vượt tồn kho thì push(false)
    for (let i = 0; i < products.length; i++) {
      const [productId, quantity] = products[i];
      // yêu cầu khóa sản phẩm để check và xử lý
      const keyLock = await acquireLock(productId, quantity, cartId);
      // nếu sản phẩm quá bán => key===null => acquireLock.push(false)
      acquireProduct.push(keyLock ? true : false);
      if (!keyLock) {
        // nếu
        // keyLock === true thì nó tự giải phóng (del) khi thanh toán thành công rồi nên không cần phải gọi releaseKeyLock
        // keyLock === false thì phải gọi releaseKeyLock để thằng khác còn vào thanh toán và báo lỗi cho nó
        await releaseLock(keyLock);
      }
    }

    // check nếu có 1 sản phẩm hết hàng trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Một số sản phẩm đã được cập nhật, vui lòng quay lại giỏ hàng!!"
      );
    }

    // thành công => tạo order
    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // trường hợp: Insert thành công, remove product có trong cart
    if (newOrder) {
      // remove product in cart
      deleteCartUser({ userId });
    }

    return newOrder;
  }
}

module.exports = CheckoutService;
