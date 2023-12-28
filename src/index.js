import express from "express"
import list from "express-list-endpoints"
import mongoose from "mongoose"
import cors from "cors"
import jwt from "jsonwebtoken"
import { User } from "./models/user.js"
import { genericErrorHandler } from "./middleware/genericErrorHandler.js"
import checkJwt from "./middleware/checkJwt.js"
import bcrypt from "bcrypt"
import helmet from "helmet"
import { limiter } from "./middleware/rateLimit.js"
import { body, validationResult } from "express-validator"

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors())

//this route is for registering a new user
//the password is hashed before saving it to the database (from the user model)
app.post(
   "/sign-up",
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
      //this if statement checks if there are any errors in the validation
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() })
      }
      try {
         const newUser = await new User(req.body).save()

         const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "4h",
         })
         res.status(201).send({ token })
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

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
         expiresIn: "4h",
      })

      res.status(200).send({ token })
   } catch (err) {
      next(err)
   }
})

//this route is for getting the user profile
app.get("/me", checkJwt, async (req, res, next) => {
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
