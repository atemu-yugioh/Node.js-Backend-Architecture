"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, required: true, default: {} },
    /*
    order_checkout = {
        total_price:  tổng tiền hàng
        free_ship:  phí vận chuyển
        total_discount:  tổng tiền giảm giá
        total_checkout:  tổng thanh toán
    }
  */
    order_shipping: { type: Object, default: {} },
    /*
    street,
    city,
    state,
    country
 */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: "#000124052023" }, // mã đơn hàng với nhà cung cấp
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createOn",
      updatedAt: "updateOn",
    },
  }
);

module.exports = {
  order: model(DOCUMENT_NAME, orderSchema),
};
