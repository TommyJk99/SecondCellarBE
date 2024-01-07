import { mongoose, Schema } from "mongoose"

// this schema is used to store sold, on sale and purchased wines
const CellarSchema = Schema({
   owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
   winesForSale: [{ type: Schema.Types.ObjectId, ref: "Wine" }],
   winesSold: [
      {
         wine: { type: Schema.Types.ObjectId, ref: "Wine" },
         dateSold: { type: Date, default: Date.now },
      },
   ],
   winesPurchased: [
      {
         wine: { type: Schema.Types.ObjectId, ref: "Wine" },
         datePurchased: { type: Date, default: Date.now },
      },
   ],
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now },
})

export const Cellar = mongoose.model("Cellar", CellarSchema)
