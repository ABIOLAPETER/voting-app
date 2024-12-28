const { Schema, model, Types } = require("mongoose");

const electionSchema = new Schema({
    title: {
        type: String,
        required: true // The title is mandatory
    },
    description: {
        type: String,
        required: true // The description is mandatory
    },
    thumbnail: {
        type: String,
        required: true // A thumbnail image is mandatory
    },
    candidates: [{
        type: Types.ObjectId, // Reference to Candidate collection
        required: true, // Candidates are mandatory
        ref: 'Candidate' // Reference model name
    }],
    voters: [{
        type: Types.ObjectId, // Reference to Voter collection
        required: true, // Voters are mandatory
        ref: 'Voter' // Reference model name
    }]
});

module.exports = model('Election', electionSchema);
