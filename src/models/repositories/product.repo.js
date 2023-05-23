const { product, electronic, clothing } = require("../product.model");
const { Types } = require("mongoose");
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} = require("../../utils");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundProduct) return null;

  foundProduct.isDraft = false;
  foundProduct.isPublish = true;

  const { modifiedCount } = await foundProduct.updateOne(foundProduct);

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundProduct) return null;

  foundProduct.isDraft = true;
  foundProduct.isPublish = false;

  const { modifiedCount } = await foundProduct.updateOne(foundProduct);

  return modifiedCount;
};

const searchProductByUser = async ({ key_search }) => {
  const regexSearch = new RegExp(key_search);
  const results = await product
    .find(
      {
        isPublish: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  return await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
};

const findProduct = async ({ product_id, unselect }) => {
  return await product.findById(product_id).select(unGetSelectData(unselect));
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const getProductById = async (productId) => {
  return await product
    .findOne({ _id: convertToObjectIdMongodb(productId) })
    .lean();
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
      }
    })
  );
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  checkProductByServer,
};
