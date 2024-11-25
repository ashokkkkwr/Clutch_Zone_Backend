import jwt from "jsonwebtoken";

export const createToken = (data:any, secret:any, expireTime:any) => {
  return jwt.sign(data, secret, {
    expiresIn: expireTime,
  });
};

export const verifyToken = (token:any, secret:any) => {
  return jwt.verify(token, secret);
};
