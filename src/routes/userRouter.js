import express from "express"
import checkJwt from "../middleware/checkJwt.js"
import { limiter } from "../middleware/rateLimit.js"

const userRouter = express.Router()

//All theses routes are protected by the checkJwt middleware and start with /me
//to access them the user must have a valid access token in the authorization header

//this route returns the user data if the access token is valid
userRouter.get("/", limiter, checkJwt, async (req, res, next) => {
   if (!req.user) {
      return res.status(404).send({ error: "User not found!" })
   }
   try {
      res.send(req.user)
   } catch (err) {
      next(err)
   }
})

export default userRouter
