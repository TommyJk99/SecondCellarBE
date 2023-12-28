import rateLimit from "express-rate-limit"

//this is a middleware that limits the number of requests a user can make to the server
export const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // = 15 minutes
   max: 50,
   standardHeaders: true,
   legacyHeaders: false,
})
