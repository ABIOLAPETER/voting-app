const notFound=(req,res,next)=>{
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}


const errorHandler = (err,req,res,next)=>{
    res.headersSent
    ? next(err)
    : res.status(err.code || 500).json({ message: err.message || "An unknown error occurred" });
}

module.exports = {notFound, errorHandler}
