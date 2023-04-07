"use strict";

const { CREATED, OK, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
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
