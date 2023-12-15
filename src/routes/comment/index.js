"use strict";

const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const commentController = require("../../controllers/comment.controller");
const router = express.Router();

///? authentication //
router.use(authenticationV2);

router.get("", asyncHandler(commentController.getListComment));
router.post("", asyncHandler(commentController.createComment));
router.delete("", asyncHandler(commentController.deleteComment));

module.exports = router;
