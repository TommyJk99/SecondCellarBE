import express from "express"
import list from "express-list-endpoints"
import mongoose from "mongoose"
import cors from "cors"
import jwt from "jsonwebtoken"
import { User } from "./models/user.js"
import { genericErrorHandler } from "./middleware/genericErrorHandler.js"

const app = express()
app.use(express.json())
app.use(cors())

//this route is for registering a new user
//the password is hashed before saving it to the database (from the user model)
app.post("/sign-up", async (req, res, next) => {
   try {
      const newUser = await new User(req.body).save()

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
         expiresIn: "1d",
      })
      res.status(201).send({ token })
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
