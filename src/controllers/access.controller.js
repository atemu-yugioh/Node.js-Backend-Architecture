"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   metaData: await AccessService.handlerRefreshToken(req.body.refreshToken),
    // }).send(res);

    // Fixed
    new SuccessResponse({
      metaData: await AccessService.handlerRefreshTokenV2({
        user: req.user,
        keyStore: req.keyStore,
        refreshToken: req.refreshToken,
      }),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      metaData: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  login = async (req, res, next) => {
    new SuccessResponse({
      metaData: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Registered OK!",
      metaData: await AccessService.signUp(req.body),
      option: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
