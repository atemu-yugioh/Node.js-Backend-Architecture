const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Create cart success!!",
      metaData: await CartService.addToCart({
        userId: req.user.userId,
        ...req.body,
      }),
    }).send(res);
  };
}

module.exports = new CartController();
