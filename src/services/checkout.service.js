"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

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
}

module.exports = CheckoutService;
