const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, // percentage
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true }, // discount Code
    discount_start_day: { type: Date, required: true }, // start day discount
    discount_end_day: { type: Date, required: true }, // end day discount
    discount_max_uses: { type: Number, required: true }, // so luong discount duoc su dung
    discount_uses_count: { type: Number, require: true }, // so luong discount da su dung
    discount_users_used: { type: Array, default: [] }, // ai da su dung
    discount_max_uses_per_user: { type: Number, required: true }, // so luong cho phep toi da cua 1 user
    discount_min_order_value: { type: Number, required: true }, // gia tri toi thieu de ap dung discount
    discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
