"use strict";

const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.get("/search", asyncHandler(productController.getListSearchProduct));
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.findProduct));

///? authentication //
router.use(authenticationV2);
//?/?////////////////
router.post("", asyncHandler(productController.createProduct));
router.patch("/:productId", asyncHandler(productController.updateProduct));
router.put(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.put(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);

//? QUERY/////////////////
router.get("/draft/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
  "/publish/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
