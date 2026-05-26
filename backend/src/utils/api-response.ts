export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export const okResponse = <T>(data: T, message = 'Operation successful'): ApiSuccessResponse<T> => ({
  success: true,
  data,
  message
});
