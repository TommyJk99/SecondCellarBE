import jwt from "jsonwebtoken"
import { User } from "../models/user.js"

const checkJwt = async (req, res, next) => {
   try {
      //this check if the access token is in a cookie called accessToken
      const token = req.cookies.accessToken

      if (!token) {
         return res.status(401).json({ error: "Access token is required!" })
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(payload.id).select(
         "-password -refreshToken -__v -createdAt -updatedAt -cellar -transactions -favorites"
         //which fields to exclude from the user object?
      )

      if (!req.user) {
         return res.status(404).json({ error: "User not found!" })
      }

      next()
   } catch (err) {
      return res.status(401).json({ error: "Invalid Token!" })
   }
}

export default checkJwt
