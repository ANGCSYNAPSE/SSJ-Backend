/** Thrown anywhere in a service/controller; caught once by the error middleware. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, errors?: { field: string; message: string }[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }

  static forbidden(message = "You do not have permission to do this") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }
}
