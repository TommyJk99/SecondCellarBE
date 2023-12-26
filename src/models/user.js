import mongoose from "mongoose"
import bcrypt from "bcrypt"
import validator from "validator"

const Schema = mongoose.Schema

const UserSchema = new Schema({
   name: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [3, "Name must be at least 3 characters long!"],
      maxlength: [50, "Name must be at most 50 characters long!"],
      trim: true,
   },
   surname: {
      type: String,
      required: [true, "Surname is required!"],
      minlength: [3, "Surname must be at least 3 characters long!"],
      maxlength: [50, "Surname must be at most 50 characters long!"],
      trim: true,
   },
   email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
   },
   password: {
      type: String,
      required: [true, "Password is required!"],
      trim: true,
   },
   address: {
      street: {
         type: String,
         required: [true, "Street is required!"],
         trim: true,
      },
      city: {
         type: String,
         required: [true, "City is required!"],
         trim: true,
      },
      postalCode: {
         type: String,
         required: [true, "Postal code is required!"],
         trim: true,
      },
      country: {
         type: String,
         required: [true, "Country is required!"],
         trim: true,
      },
   },
   role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
   },
   cellar: [{ type: Schema.Types.ObjectId, ref: "Cellar" }],
   transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
   favorites: [{ type: Schema.Types.ObjectId, ref: "Wine" }],
})

//this method will run before saving the document into the database if the password is modified
//.pre() is a middleware function that will run before the save() method
//this is better than creating a middleware function in the controller because it will run every time the save() method is called
UserSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password, 12)
   next()
})

export const User = mongoose.model("User", UserSchema)
