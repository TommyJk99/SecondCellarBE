import { Schema, mongoose } from "mongoose"

//at the moment is only an example
const TransactionSchema = Schema({
   buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
   seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
   wine: { type: Schema.Types.ObjectId, ref: "Wine", required: true },
   quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1."] },
   totalPrice: { type: Number, required: true },
   date: { type: Date, default: Date.now },
   status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
   },
   transactionDetails: {
      method: {
         type: String,
         enum: ["credit_card", "paypal", "bank_transfer"],
         required: true,
      },
      transactionId: { type: String, required: true },
   },
})

export const Transaction = mongoose.model("Transaction", TransactionSchema)
