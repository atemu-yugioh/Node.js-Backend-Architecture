"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the keyToken Model

const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    // ! Những refreshToken đã được sử dụng
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// Export the Model

module.exports = model(DOCUMENT_NAME, keyTokenSchema);
