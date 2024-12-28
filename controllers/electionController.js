const HttpError = require("../models/errorModel")
const {v4: uuid} = require("uuid")
const cloudinary = require("../Utils/cloudinary")
const electionModel = require("../models/electionModel")
const Path = require("path")
const candidateModel = require("../models/candidatesModel")




const addElection = async (req, res, next) => {
    try {
        // Uncomment the following lines if admin verification is needed
        if (!req.user.isAdmin) {
            // Check if the user is an admin, if not, throw a forbidden error
            return next(new HttpError('Only an Admin can add Elections', 403));
        }

        // Destructure title and description from the request body
        const { title, description } = req.body;
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        // Check if title and description are provided
        if (!title || !description) {
            // If either is missing, return a 422 error
            console.log(req.body); // Log request body for debugging
            return next(new HttpError('Fill in all fields', 422));
        }

        // Check if a thumbnail file is provided
        if (!req.files || !req.files.thumbnail) {
            // If the thumbnail is missing, return a 422 error
            return next(new HttpError("Choose a thumbnail", 422));
        }

        // Destructure the thumbnail file from the uploaded files
        const { thumbnail } = req.files;

        // Validate the size of the thumbnail (should be less than 1MB)
        if (thumbnail.size > 1000000) {
            // If the file is too large, return a 422 error
            return next(new HttpError("File size too big. Should be less than 1MB", 422));
        }

        // Rename the file to make it unique by appending a UUID
        let fileName = thumbnail.name; // Get the original file name
        fileName = fileName.split('.'); // Split the file name into name and extension
        fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1]; // Append a unique ID to the file name

        // Upload the file to the server's uploads folder
        await thumbnail.mv(Path.join(__dirname, "..", "uploads", fileName), async (err) => {
            if (err) {
                // Handle file move error
                return next(new HttpError(err.message || "Error while moving file", 500));
            }

            // Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(
                Path.join(__dirname, "..", "uploads", fileName),
                { resource_type: "image" } // Specify the resource type as an image
            );

            // Check if the upload to Cloudinary was successful
            if (!result.secure_url) {
                // If the upload fails, return a 422 error
                return next(new HttpError("Couldn't upload to Cloudinary", 422));
            }

            // Save the election details to the database
            const newElection = await electionModel.create({
                title, // Election title
                description, // Election description
                thumbnail: result.secure_url // URL of the uploaded thumbnail
            });

            // Respond with the newly created election details
            res.json({ newElection });
        });
    } catch (error) {
        // Catch and handle any unexpected errors
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
};




const getElections = async (req,res,next)=>{
    try {
        const elections = await electionModel.find()
        res.json({
            elections
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}


const getElection = async(req,res,next)=>{
    try {
        const {id} = req.params
        const election = await electionModel.findById(id)
        res.json({
            election
        })
    } catch (error) {
        return next (new HttpError(error))
    }
}


const updateElection = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            // Check if the user is an admin, if not, throw a forbidden error
            return next(new HttpError('Only an Admin can add Elections', 403));
        }
        const { id } = req.params; // Extract the election ID from the request params
        const { title, description } = req.body; // Extract title and description from the request body

        // // Validate input fields
        // if (!title || !description) {
        //     return next(new HttpError("Fill in all fields", 422));
        // }

        // Check if a thumbnail file is provided
        if (!req.files || !req.files.thumbnail) {
            return next(new HttpError("Choose a thumbnail", 422));
        }

        const { thumbnail } = req.files; // Destructure the thumbnail file from the uploaded files

        // Validate the size of the thumbnail
        if (thumbnail.size > 1000000) {
            return next(new HttpError("File size too big. Should be less than 1MB", 422));
        }

        // Generate a unique file name
        let fileName = thumbnail.name.split('.');
        fileName = `${fileName[0]}_${uuid()}.${fileName[fileName.length - 1]}`;

        // Upload the file to the server's uploads folder
        const uploadPath = Path.join(__dirname, "..", "uploads", fileName);
        await thumbnail.mv(uploadPath);

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(uploadPath, {
            resource_type: "image", // Specify the resource type as an image
        });

        // Check if the upload to Cloudinary was successful
        if (!result.secure_url) {
            return next(new HttpError("Couldn't upload to Cloudinary", 422));
        }

        // Update the election in the database
        const updatedElection = await electionModel.findByIdAndUpdate(
            id,
            { title, description, thumbnail: result.secure_url },
            { new: true } // Return the updated document
        );

        // Check if the election exists
        if (!updatedElection) {
            return next(new HttpError("Election not found", 404));
        }

        // Send the updated election as the response
        res.status(200).json({
            message: "Election updated successfully",
            updatedElection,
        });
    } catch (error) {
        console.error(error);
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
};




const removeElection = async(req,res,next)=>{
    try {
        if (!req.user.isAdmin) {
            // Check if the user is an admin, if not, throw a forbidden error
            return next(new HttpError('Only an Admin can add Elections', 403));
        }
        const {id} = req.params
        await electionModel.findByIdAndDelete(id)
        res.json({
            message: "Election Deleted Successfully"
        })
    } catch (error) {
        return next(new HttpError(error))
    }}


const getCandidatesOfElection = async(req,res,next)=>{
    try {
        const {id} = req.params
        const candidates = await candidateModel.find({electionId: id})
        res.json(candidates)
    } catch (error) {
        return next(new HttpError(error))
    }
}


const getElectionVoters = async(req,res,next)=>{
    try {
        const {id} = req.params
        const response = await electionModel.findById(id).populate('voters')
        res.json(response)
    } catch (error) {
        return next(new HttpError(error))
    }}

module.exports = {getElection, getElections, addElection, removeElection, getCandidatesOfElection, updateElection, getElectionVoters, updateElection}
