const JWT = require("jsonwebtoken");

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

module.exports = {
  createTokenPair,
};
