import express from "express"
import { limiter } from "../middleware/rateLimit.js"
import { Wine } from "../models/wine.js"
import { query } from "express-validator"
import validate from "../middleware/isValidationOk.js"

const wineRouter = express.Router()

// this route returns 100 random wines from the database (homepage) (testing needed)
wineRouter.get(
   "/",
   limiter,
   [
      query("page").isInt({ min: 1 }).withMessage("Page must be a positive integer"),
      query("limit").isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
   ],
   validate, // from isValidationOk.js, it controls if there are any errors in the query parameters above
   async (req, res, next) => {
      try {
         const page = req.query.page // this way or destructuring is the same
         const limit = req.query.limit
         const skip = (page - 1) * limit

         const totalDocuments = await Wine.countDocuments() //does pagination make sense here?
         const totalPages = Math.ceil(totalDocuments / limit)

         //this is a pipeline,
         const wines = await Wine.aggregate([
            { $sample: { size: totalDocuments } },
            { $skip: skip },
            { $limit: limit },
         ])

         res.status(200).json({
            totalPages: totalPages,
            currentPage: page,
            wines: wines,
         })
      } catch (err) {
         next(err)
      }
   }
)

// this route searches for wines in the database using the query parameters (testing needed)
wineRouter.get(
   "/search",
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
   validate, // this middleware checks if there are any errors using express-validator
   async (req, res, next) => {
      try {
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

//this route returns ALL the wines in order of rating (testing needed)
//if the project grows, i should add a limit to the number of wines that can be returned
wineRouter.get(
   "/top-rated",
   [
      query("page").isInt({ min: 1 }).withMessage("Page must be a positive integer"),
      query("limit")
         .isInt({ min: 1, max: 10 }) // limits the number of wines that can be returned
         .withMessage("Limit must be a positive integer between 1 and 10"),
   ],
   limiter,
   validate,
   async (req, res, next) => {
      try {
         const { page = 1, limit = 10 } = req.query
         const skip = (page - 1) * limit

         // this query returns the wines ordered by the number of favorites
         const wines = await Wine.find()
            .sort({ favoritedBy: -1 }) // -1 order by descending
            .skip(skip)
            .limit(limit)

         // Aggiorna il conteggio totale e le pagine totali
         const totalDocuments = await Wine.countDocuments() // totalDocuments is used to know how many wines there are in total
         const totalPages = Math.ceil(totalDocuments / limit) // totalPages is used to know how many pages there are in total

         res.status(200).json({ page, limit, totalPages, data: wines })
      } catch (err) {
         console.error("Error fetching top rated wines:", err)
         next(err)
      }
   }
)

export default wineRouter
