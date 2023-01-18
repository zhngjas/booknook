/* See also: https://www.npmjs.com/package/cors */
const cors = require('cors')

// Mongoose for interacting with MongoDB
// See also: https://mongoosejs.com/
const mongoose = require('mongoose')
// Express framework for building web apps
// See also: https://expressjs.com/
const express = require('express')
// Initialize Express
const app = express()


// include and activate express file upload middleware
// see also: https://www.npmjs.com/package/express-fileupload
const fileUpload = require('express-fileupload') 
app.use(fileUpload())


//================================
// Tell our Express app to add CORS headers
app.use(cors())
//================================

app.use(express.static( 'public'))
// Enable express to parse JSON data
app.use(express.json()) 
// This file sets up all our API endpoints
const api = require('./routes/api')
// tell express to use the above api routes 
app.use('/api', api)

/* Connect to MongoDB:
To connect, you must add a MongoDB connection string
as an environment variable (i.e. Replit "Secret")
The name/key of the environment variable must be "MONGODB"
The value of the variable must be a valid MongoDB connection string. 
You can locate the string in your MongoDB Atlas dashboard. */
mongoose.connect( process.env.MONGODB, (error) => {  
  if (error) handleError(error)
  else {
    console.log("MongoDB connected.")
    // Tell express to start listening
    // but only after MongoDB is connected
    app.listen(()=>{
      console.log("Express is live.")
    })
  } 
}).catch((error) => handleError(error));

// Error Handler for MongoDB:
// If there are any issues with MongoDB, 
// we will log them to the console. 
const handleError = (error)=>{
  console.log("MongoDB connection failed.")
  console.log(error.message)
  if (process.env.MONGODB){
    console.log("MONGODB="+process.env.MONGODB) 
  }    
  else{
    console.log("MONGODB environment variable not found.") 
  }
}
