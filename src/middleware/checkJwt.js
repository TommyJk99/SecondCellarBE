import jwt from "jsonwebtoken"
import { User } from "../models/user.js"

const checkJwt = async (req, res, next) => {
   try {
      const token = req.headers.authorization.split(" ")[1]
      const payload = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(payload.id).select("-password -refreshToken")

      if (!req.user) {
         return res.status(404).json({ error: "User not found!" })
      }

      next()
   } catch (err) {
      return res.status(401).json({ error: "Invalid Token!" })
   }
}

export default checkJwt
