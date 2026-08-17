export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Không tìm thấy dữ liệu') {
    super(404, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Dữ liệu không hợp lệ') {
    super(400, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
    super(403, message);
  }
}
