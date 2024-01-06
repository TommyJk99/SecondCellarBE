function setTokenCookies(res, accessToken, refreshToken) {
   const commonCookieOptions = {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      //at the moment we im not using https, so i will comment out the secure option
      sameSite: "strict",
   }

   res.cookie("accessToken", accessToken, { ...commonCookieOptions, maxAge: 15 * 60 * 1000 }) // 15 minuti
   res.cookie("refreshToken", refreshToken, { ...commonCookieOptions, maxAge: 24 * 60 * 60 * 1000 }) // 1 giorno
}

export default setTokenCookies
