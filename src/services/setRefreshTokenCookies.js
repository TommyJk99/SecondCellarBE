function setRefreshTokenCookie(res, refreshToken) {
   const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * (60 * 60 * 1000), // 1 day
   }
   res.cookie("refreshToken", refreshToken, cookieOptions)
}

export default setRefreshTokenCookie
