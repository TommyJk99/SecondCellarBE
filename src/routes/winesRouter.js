import express from "express"
import { limiter } from "../middleware/rateLimit.js"
import { Wine } from "../models/wine.js"
import { query, validationResult } from "express-validator"

//this shows all the wines in the database
const wineRouter = express.Router()

wineRouter.get(
   "/",
   // im using express validator "query" to validate the query parameters
   [
      query("page").isInt({ min: 1 }).withMessage("Page must be a positive integer"),
      query("limit")
         .isInt({ min: 1, max: 100 })
         .withMessage("Limit must be a positive integer between 1 and 100"),
      query("name").optional().isString(),
      query("producer").optional().isString(),
      query("region").optional().isString(),
      query("favorites").optional().isInt({ min: 0 }),
   ],
   limiter,
   async (req, res, next) => {
      try {
         // ValidationResult is a function that checks if there are any errors in the query parameters
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
         }

         // after the validation, i can extract the query parameters
         const { page = 1, limit = 10, name, producer, region, favorites } = req.query

         // here i create the query conditions
         let queryConditions = {}
         if (name) queryConditions.wineName = new RegExp(name, "i")
         if (producer) queryConditions.wineProducer = new RegExp(producer, "i")
         if (region) queryConditions.wineRegion = new RegExp(region, "i")
         if (favorites) queryConditions.favoritedBy = { $gte: parseInt(favorites) }

         // (page - 1) * limit = skip -> how many documents i want to skip?
         // if i am on the second page and every page has 10 documents, i want to skip the first 10 documents
         const skip = (page - 1) * limit // cursor?

         // Here i find the wines in the database using the query conditions, i skip the first "skip" documents and i limit the results to "limit" documents
         const wines = await Wine.find(queryConditions).skip(skip).limit(parseInt(limit))
         // example of a query: http://.../wines?page=2&limit=5&name=Chateau&producer=Margaux&region=Bordeaux&favorites=10

         res.status(200).send(wines)
      } catch (err) {
         next(err)
      }
   }
)

export default wineRouter
