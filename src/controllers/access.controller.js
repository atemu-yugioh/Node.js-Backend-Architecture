"use strict";

const { successMessage } = require("../../locales");
const { SuccessResponse, CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
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
      message: req.t(successMessage.login_success),
      metaData: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new CREATED({
      message: req.t(successMessage.register_success),
      metaData: await AccessService.signUp(req.body),
      option: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
