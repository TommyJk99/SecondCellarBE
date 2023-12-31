//ctrl + shift + p -> organize imports
import bcrypt from "bcrypt"
import cors from "cors"
import express from "express"
import list from "express-list-endpoints"
import { body, validationResult } from "express-validator"
import helmet from "helmet"
import mongoose from "mongoose"
import checkJwt from "./middleware/checkJwt.js"
import { genericErrorHandler } from "./middleware/genericErrorHandler.js"
import { limiter } from "./middleware/rateLimit.js"
import { User } from "./models/user.js"
import generateTokens from "./services/generateTokens.js"
import jwt from "jsonwebtoken"
import winesRouter from "./routes/winesRouter.js"

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors())

//ROUTES
app.use("wines", winesRouter)

//this route is for registering a new user
//the password is hashed before saving it to the database (from the user model)
app.post(
   "/sign-up",
   limiter,
   [
      body("email").isEmail().withMessage("Invalid email format"),
      body("password")
         .isStrongPassword({
            minLength: 10,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
         })
         .withMessage("Invalid password format"),
   ], //this controls the format of the email and password using express-validator
   async (req, res, next) => {
      //this if statement checks if there are any errors using express-validator
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() })
      }
      try {
         const newUser = await new User({ ...req.body, role: "user" }) //should i add also the other fields that the user is not permitted to change?
         const { accessToken, refreshToken } = generateTokens(newUser._id)

         newUser.refreshToken = refreshToken
         await newUser.save()

         res.status(201).send({ accessToken, refreshToken })
      } catch (err) {
         next(err)
      }
   }
)

//this route is for logging in an existing user
app.post("/sign-in", limiter, async (req, res, next) => {
   try {
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
         return res.status(404).send({ error: "User not found!" })
      }

      const isPswValid = await bcrypt.compare(password, user.password)
      if (!isPswValid) {
         return res.status(401).send({ error: "Invalid credentials!" })
      }

      const { accessToken, refreshToken } = generateTokens(user._id)

      //this is the new refresh token that will be saved in the database after the old one expires
      user.refreshToken = refreshToken
      await user.save()

      res.status(200).send({ accessToken, refreshToken })
   } catch (err) {
      next(err)
   }
})

//now I need to create a route for refreshing the access token
//thist route will be called when i receive an error when trying to access a protected route
//Should I implement an interceptor with axios?
app.post("/refresh-token", limiter, async (req, res) => {
   //remember to control if the limiter don't block the request
   try {
      //refreshTokenDb is the refresh token that is saved in the database
      const refreshTokenDb = req.body.refreshToken
      if (!refreshTokenDb) {
         return res.status(401).send({ error: "Refresh token is required" })
      }

      const { id } = jwt.verify(refreshTokenDb, process.env.REFRESH_TOKEN_SECRET)
      const user = await User.findById(id)

      if (!user || user.refreshToken !== refreshTokenDb) {
         return res.status(401).send({ error: "Invalid refresh token" })
      }

      const { accessToken, refreshToken } = generateTokens(id)

      user.refreshToken = refreshToken
      await user.save()

      res.send({ accessToken, refreshToken })
   } catch (error) {
      res.status(401).send({ error: "Invalid or expired refresh token" })
   }
})

//this route is for getting the user profile
app.get("/me", limiter, checkJwt, async (req, res, next) => {
   if (!req.user) {
      return res.status(404).send({ error: "User not found!" })
   }
   try {
      res.send(req.user)
   } catch (err) {
      next(err)
   }
})

const port = process.env.PORT || 3030

app.use(genericErrorHandler)

mongoose.connect(process.env.MONGODB_URI).then(() => {
   app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.table(list(app))
   })
})
