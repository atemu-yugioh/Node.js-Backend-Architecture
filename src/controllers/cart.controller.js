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

  // update
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart success!!",
      metaData: await CartService.addToCartV2({
        userId: req.user.userId,
        ...req.body,
      }),
    }).send(res);
  };

  // delete
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete cart success!!",
      metaData: await CartService.deleteCartItem({
        ...req.body,
      }),
    }).send(res);
  };

  // get list user cart
  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "List to cart",
      metaData: await CartService.getListUserCart({
        userId: req.query.user_id,
      }),
    }).send(res);
  };
}

module.exports = new CartController();
