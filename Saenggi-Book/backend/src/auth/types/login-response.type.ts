export type LoginResponseType = Readonly<{
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  activeServices: string[];
}>;
