"use strict";

const StatusCode = {
  AUTH_FAIL: 401,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  CONFLICT: 409,
};

const ReasonStatusCode = {
  BAD_REQUEST: "Bad request error!",
  FORBIDDEN: "Forbidden error!",
  CONFLICT: "Conflict error!",
  AUTH_FAIL: "Authentication error!",
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.CONFLICT,
    statusCode = StatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.BAD_REQUEST,
    statusCode = StatusCode.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.AUTH_FAIL,
    statusCode = StatusCode.AUTH_FAIL
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ErrorResponse,
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
};
