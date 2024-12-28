const addElection = (req,res,next)=>{
    res.send("Add new Election")
}


const getElection = (req,res,next)=>{
    res.send("get single Election")
}


const getElections = (req,res,next)=>{
    res.send("Get all Election")
}


const updateElection = (req,res,next)=>{
    res.send("Update Election")
}


const removeElection = (req,res,next)=>{
    res.send("remove Election")
}


const getCandidatesOfElection = (req,res,next)=>{
    res.send("get the candidates of the Election")
}


const getElectionVoters = (req,res,next)=>{
    res.send("Get the voters of Election")
}

module.exports = {getElection, getElections, addElection, removeElection, getCandidatesOfElection, updateElection, getElectionVoters, updateElection}
