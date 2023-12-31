import express from "express"
import { limiter } from "../middleware/rateLimit.js"

const wineRouter = express.Router()

// wineRouter.get("/", limiter, async (req, res, next) => {
//    try {
//       const { limit, skip, sortBy, order } = req.query
//       const products = await Product.find({})
//          .sort({ [sortBy]: order })
//          .limit(limit)
//          .skip(skip)
//       res.json(products)
//    } catch (err) {
//       next(err)
//    }
// })

export default wineRouter
