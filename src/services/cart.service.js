"use strict";

const { NotFoundError } = require("../core/error.response");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class CartService {
  /// START REPO CART ///
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
      $inc: {
        cart_count_products: 1,
      },
    };
    const option = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, option);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };
    const updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };
    const option = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateSet, option);
  }

  static async checkProductInCart({ cartId, productId }) {
    const query = {
      _id: convertToObjectIdMongodb(cartId),
      "cart_products.productId": productId,
    };

    return await cart.findOne(query);
  }
  /// END REPO CART ///

  static async addToCart({ userId, product = {} }) {
    const { productId } = product;
    // check exist cart
    const userCart = await cart.findOne({ cart_userId: userId });

    if (!userCart) {
      // create cart for user
      return await CartService.createUserCart({ userId, product });
    }

    // check product in cart ??
    const productInCart = await CartService.checkProductInCart({
      cartId: userCart._id,
      productId,
    });

    if (!productInCart) {
      // create cart for user
      return await CartService.createUserCart({ userId, product });
    }
    // cart exist, and this product in cart => update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  //update cart (increase and reduce cart)
  /*
    shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ],
            version
        }
    ]
  */
  static async addToCartV2({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById(productId);

    if (!foundProduct) {
      throw new NotFoundError("product not found!!");
    }
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Product do not belong to the shop");
    }

    if (quantity == 0) {
      return await CartService.deleteCartItem({ userId, productId });
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  // delete cart item
  static async deleteCartItem({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateSet = {
      $pull: {
        cart_products: {
          productId,
        },
      },
      $inc: {
        cart_count_products: -1,
      },
    };

    const cartItemDeleted = await cart.updateOne(query, updateSet);

    return cartItemDeleted;
  }

  // get list user cart
  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
