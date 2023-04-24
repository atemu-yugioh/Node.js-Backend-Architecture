"use strict";

const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created",
};

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metaData = {},
  }) {
    this.message = message ? message : reasonStatusCode;
    this.statusCode = statusCode;
    this.metaData = metaData;
  }

  send(res, header = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metaData }) {
    super({ message, metaData });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metaData,
    option = {},
  }) {
    super({ message, statusCode, reasonStatusCode, metaData });
    this.option = option;
  }
}

module.exports = {
  SuccessResponse,
  OK,
  CREATED,
};
