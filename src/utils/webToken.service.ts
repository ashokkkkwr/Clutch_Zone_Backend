import { DotenvConfig } from '../config/env.config'
import { type IJwtOptions, type IJwtPayload } from '../interface/jwt.interfaces'
import jwt from 'jsonwebtoken'
import { Role } from '../constant/enum'
class WebTokenService {
  sign(user: IJwtPayload, options: IJwtOptions, role: Role): string {
    return jwt.sign(
      {
        id: user.id,
        role,
      },
      options.secret,
      {
        expiresIn: options.expiresIn,
      }
    )
  }

  verify(token: string, secret: string): any {
    return jwt.verify(token, secret)
  }
  generateAccessToken(user: IJwtPayload, role: Role): string {
    return this.sign(
      user,
      {
        expiresIn: DotenvConfig.ACCESS_TOKEN_EXPIRES_IN,
        secret: DotenvConfig.ACCESS_TOKEN_SECRET,
      },
      role
    )
  }
  generateTokens(user: IJwtPayload, role: Role): { accessToken: string; refreshToken: string } {
    console.log("🚀 ~ WebTokenService ~ generateTokens ~ role:", role)
    console.log("🚀 ~ WebTokenService ~ generateTokens ~ user:", user)
    console.log('first')
    console.log("🚀 ~ WebTokenService ~ generateTokens ~ DotenvConfig.ACCESS_TOKEN_SECRET:", DotenvConfig.ACCESS_TOKEN_SECRET)
    console.log("🚀 ~ WebTokenService ~ generateTokens ~ DotenvConfig.ACCESS_TOKEN_EXPIRES_IN:", DotenvConfig.ACCESS_TOKEN_EXPIRES_IN)
    const accessToken = this.sign(
      user,
      {
        expiresIn: DotenvConfig.ACCESS_TOKEN_EXPIRES_IN,
        secret: DotenvConfig.ACCESS_TOKEN_SECRET,
      },
      role
    )
        
       
    console.log('ya??')
    const refreshToken = this.sign(
      user,
      {
        expiresIn: DotenvConfig.REFRESH_TOKEN_EXPIRES_IN,
        secret: DotenvConfig.REFRESH_TOKEN_SECRET,
      },
      role
    )
    return { accessToken, refreshToken }
  }
}
export default new WebTokenService()
