const JWT = require("jsonwebtoken");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const asyncHandler = require("../helpers/asyncHandler");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // ? accesstoken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("error verify::", err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * ?1 - Check userId missing???
   * ?2 - get accessToken
   * ?3 - verifyToken
   * ?4 - check user in dbs
   * ?5 - check keyStore with this userId
   * ?6 - OK all, => return next()
   */

  //?1.
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request!!");

  //?2.
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore!!");

  //?3.
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request!!");

  try {
    const decodeUser = await verifyJWT(accessToken, keyStore.publicKey);

    //?5.
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    //?6.
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, secretKey) => {
  return await JWT.verify(token, secretKey);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
