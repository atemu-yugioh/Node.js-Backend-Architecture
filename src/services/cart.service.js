"use strict";

const { cart } = require("../models/cart.model");

class CartService {
  /// START REPO CART ///
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
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

  static async checkProductInCart({ userId, productId }) {
    const query = { cart_userId: userId, "cart_products.productId": productId };

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

    // cart exist but no product
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    // check product in cart ??
    const productInCart = await CartService.checkProductInCart({
      userId,
      productId,
    });

    if (productInCart) {
      // cart exist, and this product in cart => update quantity
      return await CartService.updateUserCartQuantity({ userId, product });
    }

    // create cart for user
    return await CartService.createUserCart({ userId, product });
  }
}

module.exports = CartService;
