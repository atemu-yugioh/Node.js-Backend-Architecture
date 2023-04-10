"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = ({ selectField = [] }) => {
  return Object.fromEntries(selectField.map((el) => [el, 1]));
};

const unGetSelectData = ({ unSelectField = [] }) => {
  return Object.fromEntries(unSelectField.map((el) => [el, 0]));
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
};
