const addCandidate = (req , res, next)=>{
    res.send("add candidates")
}

const getCandidate = (req , res, next)=>{
    res.send("get candidates")
}

const removeCandidate = (req , res, next)=>{
    res.send("delete candidates")
}

const voteCandidate = (req , res, next)=>{
    res.send("vote candidates")
}

module.exports={getCandidate, addCandidate, voteCandidate, removeCandidate}
