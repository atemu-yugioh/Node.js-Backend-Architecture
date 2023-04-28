"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create New Discount Code Success",
      metaData: await DiscountService.generateDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "List discount of shop",
      metaData: await DiscountService.getAllDiscountCodeOfShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Discount amount",
      metaData: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };

  getAllProductByDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "list product of discount code",
      metaData: await DiscountService.getAllProductByDiscountCode({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
