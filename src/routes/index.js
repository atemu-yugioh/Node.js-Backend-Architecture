"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// Check Apikey
router.use(apiKey);
// Check Permission
router.use(permission("0000"));

router.use("/v1/api", require("./access"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api/discount", require("./discount"));

// router.get("", (req, res, next) => {
//   return res.status(200).json({
//     message: "index.routes",
//   });
// });

module.exports = router;
