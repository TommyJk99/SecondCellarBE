import { mongoose, Schema } from "mongoose"

const FavoriteSchema = new Schema({
   user: { type: Schema.Types.ObjectId, ref: "User", required: true },
   wines: [{ type: Schema.Types.ObjectId, ref: "Wine" }],
   createdAt: { type: Date, default: Date.now },
})

export const Favorite = mongoose.model("Favorite", FavoriteSchema)
