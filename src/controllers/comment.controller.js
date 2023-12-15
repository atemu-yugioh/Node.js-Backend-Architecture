const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new comment success",
      metaData: await CommentService.createComment({ ...req.body }),
    }).send(res);
  };

  getListComment = async (req, res, next) => {
    new SuccessResponse({
      message: "success",
      metaData: await CommentService.getCommentByParentId({ ...req.query }),
    }).send(res);
  };
}

module.exports = new CommentController();
