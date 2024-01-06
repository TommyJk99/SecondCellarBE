import { mongoose, Schema } from "mongoose"
import bcrypt from "bcrypt"

const UserSchema = new Schema({
   name: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   surname: {
      type: String,
      required: [true, "Surname is required!"],
      minlength: [1, "Surname must be at least 1 characters long!"],
      maxlength: [40, "Surname must be at most 40 characters long!"],
      trim: true,
   },
   email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true, //this will create an index in the database that will not allow duplicate values for this field
      trim: true,
   },
   password: {
      type: String,
      required: [true, "Password is required!"],
      trim: true,
   },
   profilePicture: {
      type: String,
      default: "https://randomuser.me/api/portraits/med/men/14.jpg",
   },
   address: {
      street: {
         type: String,
         // required: [true, "Street is required!"],
         trim: true,
      },
      city: {
         type: String,
         // required: [true, "City is required!"],
         trim: true,
      },
      postalCode: {
         type: String,
         // required: [true, "Postal code is required!"],
         trim: true,
      },
      country: {
         type: String,
         // required: [true, "Country is required!"],
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

   createdAt: {
      type: Date,
      default: Date.now,
   },

   updatedAt: {
      type: Date,
      default: Date.now,
   },
})

//this method will run before saving the document into the database if the password is modified
//.pre() is a middleware function that will run before the save() method
//this is better than creating a middleware function in the controller because it will run every time the save() method is called
UserSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password, 12)
   next()
})

export const User = mongoose.model("User", UserSchema, "user")
