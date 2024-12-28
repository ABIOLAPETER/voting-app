const {Router} = require("express")
const {registerVoter, login, getVoter}= require("../controllers/voterController")
const {addElection, getCandidatesOfElection, getElection, getElectionVoters,getElections,removeElection,updateElection} = require('../controllers/electionController')
const {addCandidate, getCandidate, removeCandidate, voteCandidate} = require("../controllers/candidateController")
const router = Router()
// router.get('/', (req,res)=>{
//     res.send('its working bro')
// })
// voters routes
router.post('/voters/register', registerVoter)
router.post('/voters/login', login)
router.get('/voters/:id', getVoter)

// election routes
router.post('/elections', addElection)
router.get('/elections', getElections)
router.get('/elections/:id', getElection)
router.delete('/elections/:id', removeElection)
router.patch('/elections/:id', updateElection)
router.get('/elections/:id/candidates', getCandidatesOfElection)
router.get('/elections/:id/voters', getElectionVoters)

// candidates routes
router.get('/candidates/:id', getCandidate)
router.post('/candidates', addCandidate)
router.delete('/candidates/:id', removeCandidate)
router.patch('/candidates/:id', voteCandidate)
module.exports = router
