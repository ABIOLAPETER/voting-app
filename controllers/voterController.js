const voterModel = require("../models/voterModel")
const HttpError = require("../models/errorModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const generateToken = (payload)=>{
    const token = jwt.sign(payload, process.env.secret, {expiresIn: "1d"})
    return token
}
const registerVoter = async (req, res, next) => {
    try {
        const { fullName, email, password, password2 } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        // Normalize the email to lowercase
        const newEmail = email.toLowerCase();

        // Check if the email already exists
        const emailExists = await voterModel.findOne({ email: newEmail });
        if (emailExists) {
            return next(new HttpError("Email already exists", 422));
        }

        // Validate password length
        if (password.trim().length < 6 || password2.trim().length < 6) {
            return next(new HttpError("Passwords should be at least 6 characters long", 422));
        }

        // Check if passwords match
        if (password !== password2) {
            return next(new HttpError("Passwords do not match", 422));
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine if i am the new user
        let isAdmin = false;

        if (newEmail === "peterboluwatife69@gmail.com"){
            isAdmin = true;
        };

        // Create a new voter
        const newVoter = await voterModel.create({
            fullName,
            email: newEmail,
            password: hashedPassword,
            isAdmin,
        });

        // Respond with success
        res.status(201).json({ message: `New voter ${fullName} added` });
    } catch (error) {
        // Handle errors
        console.log(error)
        return next(new HttpError("Voter registration failed", 500));
    }
};




const login = async(req,res,next)=>{
    try {
        const {email, password} = req.body
        // validate user password
        if(!email || !password){
            return next(new HttpError("All fields are required", 422))
        }

        const newEmail = email.toLowerCase()
        const voter = await voterModel.findOne({email: newEmail})

        if (!voter){
            return next (new HttpError("Voter not in Database", 422))
        }

        //compare password
        const comparePass = await bcrypt.compare(password, voter.password)
        if (!comparePass){
            return next(new HttpError('passwords do not match', 422))
        }
         const {isAdmin, _id:id, votedElections} = voter
         const token = generateToken({id, isAdmin})
         res.json({
            id,
            isAdmin,
            token,
            votedElections
         })
    } catch (error) {
        console.log(error)
        return next (new HttpError("Login Failed. Check credentials", 400))
    }
}


const getVoter = async(req,res,next)=>{
    try {
        const {id} = req.params
        const voter = await voterModel.findById(id).select('-password')

        res.json({
            voter
        })
    } catch (error) {
        console.log(error)
        return next (new HttpError('Couldnt get User', 422))
    }
}

module.exports={registerVoter, login, getVoter}
