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

export {
  NotFoundError,
  ValidationError,
  UniqueViolationError
}
