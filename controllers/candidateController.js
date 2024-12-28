const HttpError = require("../models/errorModel")
const electionModel = require("../models/electionModel")
const candidateModel = require("../models/candidatesModel")
const voterModel = require('../models/voterModel')
const Path = require("path")
const {v4: uuid} = require("uuid")
const cloudinary = require("../Utils/cloudinary")
const mongoose = require("mongoose")
const addCandidate = async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (!req.user.isAdmin) {
            // If the user is not an admin, return a 403 Forbidden error
            return next(new HttpError('Only an Admin can add Candidates', 403));
        }

        // Destructure the required fields from the request body
        const { fullName, motto, currentElection } = req.body;

        // Validate that all required fields are present
        if (!fullName || !motto || !currentElection) {
            // If any field is missing, return a 422 Unprocessable Entity error
            console.log(req.body); // Log the request body for debugging purposes
            return next(new HttpError('Fill in all fields', 422));
        }

        // Check if an image file is provided in the request
        if (!req.files || !req.files.image) {
            // If the image is missing, return a 422 Unprocessable Entity error
            return next(new HttpError("Choose an image", 422));
        }

        // Extract the image file from the request
        const { image } = req.files;

        // Validate the size of the image (limit to 1MB)
        if (image.size > 1000000) {
            // If the file size exceeds the limit, return a 422 error
            return next(new HttpError("Image size too big. Should be less than 1MB", 422));
        }

        // Generate a unique filename for the image
        let fileName = image.name; // Get the original file name
        fileName = fileName.split('.'); // Split the name into the base name and extension
        fileName = `${fileName[0]}_${uuid()}.${fileName[fileName.length - 1]}`; // Append a UUID for uniqueness

        // Upload the image to the server's uploads folder
        const uploadPath = Path.join(__dirname, "..", "uploads", fileName); // Determine the upload path
        await image.mv(uploadPath, async (err) => {
            if (err) {
                // Handle errors during the file move process
                return next(new HttpError(err.message || "Error while moving file", 500));
            }

            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(uploadPath, {
                resource_type: "image", // Specify the resource type as an image
            });

            // Check if the Cloudinary upload was successful
            if (!result.secure_url) {
                // If the upload fails, return a 422 error
                return next(new HttpError("Couldn't upload to Cloudinary", 422));
            }

            // Save the candidate details to the database
            const newCandidate = new candidateModel({
                fullName, // Candidate's full name
                motto, // Candidate's motto
                image: result.secure_url, // Secure URL of the uploaded image
                election: currentElection, // The associated election ID
            });

            // Retrieve the election from the database using the provided ID
            const election = await electionModel.findById(currentElection);

            // Start a database transaction to ensure consistency
            const session = await mongoose.startSession();
            session.startTransaction();

            // Save the candidate in the database
            await newCandidate.save({ session });

            // Add the candidate to the election's list of candidates
            election.candidates.push(newCandidate);

            // Save the updated election to the database
            await election.save({ session });

            // Commit the transaction
            await session.commitTransaction();

            // Respond with the newly created candidate details
            res.status(201).json({
                message: "Candidate added successfully",
                candidate: newCandidate,
            });
        });
    } catch (error) {
        // Handle unexpected errors and return a 500 Internal Server Error
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
};


const getCandidate = async(req , res, next)=>{
    try {
        const {id} = req.params
        const candidate = await candidateModel.findById(id)
        res.json(candidate)
    } catch (error) {
       return next (new HttpError(error))
    }
}

const removeCandidate = async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (!req.user.isAdmin) {
            return next(new HttpError('Only an Admin can remove Candidates', 403));
        }

        const { id } = req.params;
        // Find the candidate by ID and populate the associated election details
        let currentCandidate = await candidateModel.findById(id).populate('electionId');

        if (!currentCandidate) {
            return next(new HttpError("Couldn't find the candidate to delete", 422));
        }

        // Start a MongoDB transaction to ensure data consistency
        const session = await mongoose.startSession();
        session.startTransaction();

        // Remove the candidate from each associated election
        for (let election of currentCandidate.electionId) {
            const electionDoc = await electionModel.findById(election._id).session(session);
            if (electionDoc) {
                electionDoc.candidates.pull(currentCandidate._id);
                await electionDoc.save({ session });
            }
        }

        // Delete the candidate
        await currentCandidate.deleteOne({ session });

        // Commit the transaction
        await session.commitTransaction();

        // Respond with a success message
        res.json('Candidate deleted successfully');
    } catch (error) {
        console.log(error.message);
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
};



const voteCandidate = async (req, res, next) => {
    let session;
    try {
        const { id: candidateId } = req.params;
        const { currentVoterId, selectedElectionId } = req.body;

        // Get the candidate
        const candidate = await candidateModel.findById(candidateId);
        if (!candidate) {
            return next(new HttpError("Candidate not found", 404));
        }

        // Start a session and transaction for data consistency
        session = await mongoose.startSession();
        session.startTransaction();

        // Get voter
        let voter = await voterModel.findById(currentVoterId);
        if (!voter) {
            return next(new HttpError("Voter not found", 404));
        }

        // Check if the voter has already voted in the selected election
        if (voter.votedElections.includes(selectedElectionId)) {
            return next(new HttpError("You have already voted in this election", 400));
        }

        // Get the election
        let election = await electionModel.findById(selectedElectionId);
        if (!election) {
            return next(new HttpError("Election not found", 404));
        }

        // Add voter to election's list of voters and election to voter's list of voted elections
        election.voters.push(voter);
        voter.votedElections.push(election);

        // Save the election and voter
        await election.save({ session });
        await voter.save({ session });

        // Update the candidate's vote count only if the vote is successful
        const newVoteCount = candidate.voteCount + 1;
        await candidateModel.findByIdAndUpdate(candidateId, { voteCount: newVoteCount }, { new: true, session });

        // Commit the transaction to save all changes
        await session.commitTransaction();

        // Respond with a success message
        res.json({ message: "Vote casted successfully" });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (session) {
            await session.abortTransaction();
        }

        // Log and return error response
        console.log(error);
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    } finally {
        // End the session to release resources
        if (session) {
            session.endSession();
        }
    }
};




module.exports={getCandidate, addCandidate, voteCandidate, removeCandidate}
