


const jwt = require("jsonwebtoken")
const HttpError = require("../models/errorModel")


const authMiddleware = async(req,res,next)=>{
    const Authorization = req.headers.authorization || req.headers.Authorization

    if (Authorization && Authorization.startsWith("Bearer")){
        const token = Authorization.split(' ')[1]

        jwt.verify(token, process.env.secret, (err, info)=>{
            if(err){
                return next(new HttpError('Unauthorized. invalid Token', 403))

            }
        req.user = info
        next();
        })

        }else{
                return next(new HttpError("Unaauthorized. No token", 403))
        }



}

module.exports = authMiddleware
