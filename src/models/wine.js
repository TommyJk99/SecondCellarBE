import { mongoose, Schema } from "mongoose"

const WhineSchema = new Schema({
   wineName: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   typeOfWine: {
      type: String,
      required: [true, "Name is required!"],
      enum: ["white", "red", "sparkling", "rosé", "passito"],
      trim: true,
   },
   wineProducer: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   vintage: {
      type: Number,
      required: [true, "Name is required!"],
      minlength: [4, "Name must be at least 1 characters long!"],
      maxlength: [4, "Name must be at most 10 characters long!"],
      trim: true,
   },
   wineRegion: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   grapes: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   wineDescription: {
      type: String,
      required: [true, "Name is required!"],
      minlength: [10, "Name must be at least 10 characters long!"],
      maxlength: [1000, "Name must be at most 1000 characters long!"],
      trim: true,
   },
   winePrice: {
      type: Number,
      required: [true, "Name is required!"],
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [12, "Name must be at most 10 characters long!"],
   },
   availableQuantity: {
      type: Number,
      default: 1,
      minlength: [1, "Name must be at least 1 characters long!"],
      maxlength: [40, "Name must be at most 40 characters long!"],
      trim: true,
   },
   wineImmages: [
      {
         type: String,
         required: [true, "Name is required!"],
      },
   ],
   favoritedBy: {
      type: Number,
      default: 0,
   },

   publisher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
})

export const Wine = mongoose.model("Wine", WhineSchema)
