//ctrl + shift + p -> organize imports
import bcrypt from "bcrypt"
import cors from "cors"
import express from "express"
import list from "express-list-endpoints"
import { body } from "express-validator"
import helmet from "helmet"
import mongoose from "mongoose"
import { genericErrorHandler } from "./middleware/genericErrorHandler.js"
import { limiter } from "./services/rateLimit.js"
import { User } from "./models/user.js"
import generateTokens from "./services/generateTokens.js"
import jwt from "jsonwebtoken"
import winesRouter from "./routes/winesRouter.js"
import validate from "./middleware/isValidationOk.js"
import cookieParser from "cookie-parser"
import setTokenCookies from "./services/setTokenCookies.js"
import usersRouter from "./routes/usersRouter.js"

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors())
app.use(cookieParser())

//ROUTES
app.use("/wines", winesRouter)
app.use("/users", usersRouter)

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
   validate, //this middleware checks if there are any errors using express-validator
   async (req, res, next) => {
      try {
         const newUser = await new User({ ...req.body, role: "user" }) //should i add also the other fields that the user is not permitted to change?
         const { accessToken, refreshToken } = generateTokens(newUser._id)

         await newUser.save()

         //this function is used to set the access token and refresh token cookies
         setTokenCookies(res, accessToken, refreshToken)

         res.status(201).send({ message: "User created!" })
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

      setTokenCookies(res, accessToken, refreshToken)

      res.status(200).send({ message: "Login successful!" })
   } catch (err) {
      next(err)
   }
})

//this route is for refreshing the access token using the refresh token cookie
//this route will be called when i receive an error when trying to access a protected route
//Should I implement an interceptor with axios?
app.post("/refresh-token", limiter, async (req, res) => {
   try {
      //refreshTokenDb is the refresh token that is saved in the database
      const refreshTokenFromCookie = req.cookies.refreshToken

      if (!refreshTokenFromCookie) {
         return res.status(401).send({ error: "Refresh token is required" })
      }

      // if the token is not valid it will throw an error that will be catched by the catch block at the end of the try block
      const { id } = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET)
      //if the refresh token is valid, i generate a new access token and refresh token
      const { accessToken, refreshToken } = generateTokens(id)
      //and i set the new access token and refresh token cookies
      setTokenCookies(res, accessToken, refreshToken)

      res.send({ message: "Tokens refreshed!" })
   } catch (error) {
      res.status(401).send({ error: "Invalid or expired refresh token" })
   }
})

// this route is for logging out a user
app.post("/sign-out", limiter, async (req, res, next) => {
   try {
      const refreshTokenFromCookie = req.cookies.refreshToken
      if (!refreshTokenFromCookie) {
         return res.status(401).send({ error: "Refresh token is required" })
      }

      //this will delete the refresh and access token cookies
      res.clearCookie("refreshToken")
      res.clearCookie("accessToken")

      res.send({ message: "Logout successful!" })
   } catch (error) {
      next(error)
   }
})

//if the user write an invalid path, this route will be called
app.use("*", (req, res) => {
   console.error(`404 Error: Path not found - ${req.originalUrl}`)

   res.status(404).json({
      error: "Not Found",
      message: "This route does not exist!",
   })
})

const port = process.env.PORT || 3030

app.use(genericErrorHandler)

mongoose.connect(process.env.MONGODB_URI).then(() => {
   app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.table(list(app))
   })
})
