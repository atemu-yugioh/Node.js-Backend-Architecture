const { unGetSelectData, getSelectData } = require("../../utils");
const discount = require("../discount.model");

const findAllDiscountCodesSelect = async ({
  limit,
  sort,
  page,
  filter,
  select,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  return await discount
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
};

const findAllDiscountCodesUnSelect = async ({
  limit,
  sort,
  page,
  filter,
  unselect,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  return await discount
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unselect))
    .lean();
};

const checkExistDiscount = async ({ model, filter }) => {
  return model.findOne(filter).lean();
};

module.exports = {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnSelect,
  checkExistDiscount,
};
