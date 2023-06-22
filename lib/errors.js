export class AmbrError extends Error {
  constructor(code, ...params) {
    if (typeof code !== "string" || !/^[A-Z_]+$/.test(code)) {
      throw new Error("AmbrError requires a valid code parameter");
    }

    // Pass remaining arguments to parent constructor
    super(...params);

    // Maintains proper stack trace for where error was thrown (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AmbrError);
    }

    this.name = "AmbrError";
    this.code = code;
  }
}

export class ApiError extends Error {
  constructor(status = 400, ...params) {
    if (typeof status !== "number") {
      throw new Error("ApiError requires a valid status parameter");
    }

    // Pass remaining arguments to parent constructor
    super(...params);

    // Maintains proper stack trace for where error was thrown (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.status = status;
  }
}

export function shouldReportError(err) {
  // Don't send AmbrError to Sentry
  if (err instanceof AmbrError) {
    return false;
  }

  // Don't send 410 Gone to Sentry
  const isGoneError = err.res?.status === 410;
  return !isGoneError;
}
