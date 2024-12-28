const express = require("express")
const cors = require("cors")
const {connect} = require("mongoose")
require("dotenv").config()
const morgan = require("morgan")
const upload = require('express-fileupload')

const {errorHandler,notFound} = require("./middleware/errorMiddleware.js")
const Routes = require("./routes/routes.js")
const app = express()
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))
app.use(morgan('tiny'))
app.use(upload())

app.use(cors({credentials: true, origin: ["https://localhost:3000"]}))
app.use('/api/v1/voting-app', Routes)
app.use(notFound)
app.use(errorHandler)


connect(process.env.CONN_STR).then(app.listen(process.env.PORT, ()=>{
    console.log(`server has started on port ${process.env.PORT}`)
})).catch(err => console.log(err))
