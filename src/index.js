import express from "express"
import list from "express-list-endpoints"
import mongoose from "mongoose"

const app = express()

const port = process.env.PORT || 3030

mongoose.connect(process.env.MONGODB_URI).then(() => {
   app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.table(list(app))
   })
})
