export const genericErrorHandler = (err, req, res, next) => {
   let response = {
      status: "error",
      message: "",
   }

   switch (err.name) {
      case "ValidationError":
         response.message = "Validation error: please check your input."
         res.status(400)
         break
      case "UnauthorizedError":
         response.message =
            "Unauthorized access: you do not have the necessary permissions."
         res.status(401)
         break
      case "CustomError":
         response.message = err.message || "A custom error occurred."
         res.status(err.statusCode || 500)
         break
      default:
         if (err.code === 11000) {
            response.message =
               "Duplicate entry found: the provided email already exists."
            res.status(400)
         } else {
            response.message =
               "Internal server error: an unexpected error occurred."
            res.status(err.statusCode || 500)
         }
   }

   // Logging the error for internal tracking
   console.error(`Error Logged: ${err.name} - ${err.message}`)

   // Sending the error response
   res.json(response)
}
