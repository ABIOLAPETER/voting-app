const {Schema, model, Types} = require("mongoose")

const electionSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    details:{
        type: String,
        required: true
    },
    thumbmail:{
        type: String,
        required: true
    },
    candidates:[{
        types: Types.ObjectId,
        required: true,
        ref: 'Candidate'
    }],
    voters:[{
        types: Types.ObjectId,
        required: true,
        ref: 'Voter'
    }],
})

module.exports = model('Election', electionSchema)
