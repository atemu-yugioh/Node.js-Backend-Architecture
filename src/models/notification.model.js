const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "notification";
const COLLECTION_NAME = "notifications";

const notificationSchema = new Schema(
  {
    noti_type: {
      type: String,
      enum: ["ORDER-001", "ORDER-002", "SHOP-001", "PROMOTION-001"],
    },
    noti_receiverId: { type: Number, required: true },
    noti_senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    noti_content: { type: String, required: true },
    noti_options: { type: Object, default: {} },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
