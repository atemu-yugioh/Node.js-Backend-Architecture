"use strict";

const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const cartController = require("../../controllers/cart.controller");
const checkoutController = require("../../controllers/checkout.controller");
const router = express.Router();

// review checkout without login
router.post("/review", asyncHandler(checkoutController.checkoutReview));

///? authentication //
// router.use(authenticationV2);
//?/?////////////////

module.exports = router;
