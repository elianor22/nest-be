export class ApiResponse<T> {
  public statusCode: number;
  public message?: string;
  public data: T;
}
