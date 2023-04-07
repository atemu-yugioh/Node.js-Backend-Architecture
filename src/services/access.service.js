"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");

// ** SERVICE
const ShopService = require("./shop.service");

const RoleShop = {
  SHOP: "001",
  WRITER: "002",
  EDITOR: "003",
  ADMIN: "004",
};

class AccessService {
  /**
   * ? 1 - check email in dbs
   * ? 2 - match password
   * ? 3 - create AT vs RT and save
   * ? 4 - generate tokens
   * ? 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    //? 1.
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered!!!");
    }

    //? 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error!");

    //? 3.
    //? create privateKey and publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //? 4. generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId: userId, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      userId: userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // ? Step 1: check email exist

    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // ? created privateKey, publicKey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      //? Public key CryptoGraphy standards

      // ? create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      //? Save KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
      });

      if (!keyStore) {
        return {
          code: "xxxx",
          message: "keyStore error",
        };
      }

      return {
        code: 201,
        metaData: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
  };
}

module.exports = AccessService;
