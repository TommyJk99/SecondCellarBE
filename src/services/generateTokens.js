import jwt from "jsonwebtoken"

export default function generateTokens(userId) {
   const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1m",
   })

   const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
   })

   return { accessToken, refreshToken }
}
