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

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors())

//this route is for registering a new user
//the password is hashed before saving it to the database (from the user model)
app.post("/sign-up", async (req, res, next) => {
   try {
      const newUser = await new User(req.body).save()

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
         expiresIn: "4h",
      })
      res.status(201).send({ token })
   } catch (err) {
      next(err)
   }
})

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

const port = process.env.PORT || 3030

app.use(genericErrorHandler)

mongoose.connect(process.env.MONGODB_URI).then(() => {
   app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.table(list(app))
   })
})
