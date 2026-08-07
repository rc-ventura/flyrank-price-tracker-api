class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;

  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class UniqueViolationError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'UniqueViolationError';
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class TooManyRequestsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TooManyRequestsError';
    this.statusCode = 429;
  }
}

export {
  NotFoundError,
  ValidationError,
  UniqueViolationError,
  AuthenticationError,
  ForbiddenError,
  TooManyRequestsError
}
