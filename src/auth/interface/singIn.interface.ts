export interface ISignInResponse {
  readonly status: number;
  readonly message?: string;
  data: IToken;
}

export interface IToken {
  readonly accessToken: string;
  readonly expiresIn: number | string;
  readonly refreshToken: string;
}
