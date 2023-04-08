"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");

// ** SERVICE
const ShopService = require("./shop.service");

const RoleShop = {
  SHOP: "001",
  WRITER: "002",
  EDITOR: "003",
  ADMIN: "004",
};

class AccessService {
  static handlerRefreshTokenV2 = async ({ user, keyStore, refreshToken }) => {
    console.log(
      "🚀 ~ file: access.service.js:26 ~ AccessService ~ handlerRefreshTokenV2= ~ keyStore:",
      keyStore
    );
    const { userId, email } = user;

    //? Check refreshToken này đã được sử dụng chưa
    //? nếu có
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      //? để đảm bảo an toàn => xóa tất cả các token trong keyStore => Nếu là người dùng thật thì login lại đc
      await KeyTokenService.deleteKeyByUSerId(userId);
      throw new ForbiddenError(" something went wrong happen !! Pls relogin ");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered");
    }

    //? check userId
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    //? Tạo 1 cặp token mới
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //? update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  /**
   * ? Check this token used
   */
  static handlerRefreshToken = async (refreshToken) => {
    //? Check refreshToken này đã được sử dụng chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    //? nếu có
    if (foundToken) {
      //? decode xem mày là thằng nào
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log(userId, email);
      //? để đảm bảo an toàn => xóa tất cả các token trong keyStore => Nếu là người dùng thật thì login lại đc
      await KeyTokenService.deleteKeyByUSerId(userId);
      throw new ForbiddenError(" something went wrong happen !! Pls relogin ");
    }

    //? NO, refreshToken không bị leak
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registered");
    }

    //? verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    //? check userId
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    //? Tạo 1 cặp token mới
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //? update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
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
