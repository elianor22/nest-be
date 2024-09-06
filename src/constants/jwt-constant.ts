export const jwtConstants = {
  secret: `${process.env.JWT_SECRET}`,
  expires_in: `${process.env.JWT_EXPIRES_IN}`,
};
