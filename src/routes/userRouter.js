import express from "express"
import checkJwt from "../middleware/checkJwt.js"
import { limiter } from "../middleware/rateLimit.js"
import { body, validationResult } from "express-validator"
import validate from "../middleware/isValidationOk.js"
import { User } from "../models/user.js"
import bcrypt from "bcrypt"

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

//this route is for updating the user data
userRouter.put(
   "/",
   limiter,
   checkJwt,
   //these are the validation rules for the user data
   [
      body("name").optional().trim().isLength({ min: 1, max: 40 }),
      body("surname").optional().trim().isLength({ min: 1, max: 40 }),
      body("password").optional().isStrongPassword(),
      body("profilePicture").optional().trim(),
      body("address.street").optional().trim(),
      body("address.city").optional().trim(),
      body("address.postalCode").optional().trim(),
      body("address.country").optional().trim(),
   ],
   validate, //this middleware checks if there are any errors using express-validator
   async (req, res, next) => {
      try {
         if (!req.user) {
            return res.status(404).send({ error: "User not found!" })
         }

         delete req.body.email //the user cannot change the email
         delete req.body.role //the user cannot change the role

         // the user id is given by the checkJwt middleware
         const updates = req.body
         const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
         })

         // the password is hashed before saving it to the database (from the user model)
         // but in this case the document is not saved, so the password is not hashed
         // so i have to hash it manually
         if (updates.password) {
            updatedUser.password = await bcrypt.hash(updates.password, 12)
            await updatedUser.save()
         }

         if (!updatedUser) {
            return res.status(404).send({ error: "User not found!" })
         }

         res.send(updatedUser)
      } catch (err) {
         next(err)
      }
   }
)

export default userRouter
