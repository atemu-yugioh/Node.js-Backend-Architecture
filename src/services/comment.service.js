/**
 * key feature: Comment service
 * add comment: [User, Shop]
 * get list of comment: [User, Shop]
 * delete a comment: [User | Shop | Admin]
 */
const mongoose = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const Comment = require("../models/comment.model");
const { getProductById } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const comment = new Comment({
      comment_productId: productId,
      comment_content: content,
      comment_userId: userId,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      const commentFound = await Comment.findOne({
        _id: convertToObjectIdMongodb(parentCommentId),
      });

      if (!commentFound) {
        throw new BadRequestError("Comment not exist");
      }

      rightValue = commentFound.comment_right;

      // update all comment.right >= rightValue
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      );

      // update all comment.left >  rightValue
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        {
          comment_productId: convertToObjectIdMongodb(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );

      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();

    return comment;
  }

  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
      const parent = await Comment.findOne({
        _id: convertToObjectIdMongodb(parentCommentId),
      });

      if (!parent) {
        throw new Error("Not found comment for product");
      }

      const comment = await Comment.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lte: parent.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({
          comment_left: 1,
        });

      return comment;
    }

    return await Comment.find({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_parentId: parentCommentId,
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });
  }

  static async deleteComment({ commentId, productId }) {
    const product = await getProductById(productId);

    if (!product) {
      throw new BadRequestError("product not exist!!");
    }

    const commentFound = await Comment.findById(commentId);

    if (!commentFound) {
      throw new BadRequestError("comment not exist!!");
    }

    const leftValue = commentFound.comment_left;
    const rightValue = commentFound.comment_right;

    // calculate width update
    const width = rightValue - leftValue + 1;

    // delete comment and child comment
    await Comment.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });

    // update right  value
    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gt: rightValue },
      },
      {
        $inc: {
          comment_right: -width,
        },
      }
    );

    // update left value
    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: {
          comment_left: -width,
        },
      }
    );

    return true;
  }
}

module.exports = CommentService;
