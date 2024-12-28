const {Router} = require("express")
const {registerVoter, login, getVoter}= require("../controllers/voterController")
const {addElection, getCandidatesOfElection, getElection, getElectionVoters,getElections,removeElection,updateElection} = require('../controllers/electionController')
const {addCandidate, getCandidate, removeCandidate, voteCandidate} = require("../controllers/candidateController")
const authMiddleware = require('../middleware/authenticationMiddleware')
const router = Router()
// router.get('/', (req,res)=>{
//     res.send('its working bro')
// })
// voters routes
router.post('/voters/register', registerVoter)
router.post('/voters/login', login)
router.get('/voters/:id',authMiddleware, getVoter)

// election routes
router.post('/elections', authMiddleware, addElection)
router.get('/elections',authMiddleware, getElections)
router.get('/elections/:id',authMiddleware, getElection)
router.delete('/elections/:id',authMiddleware, removeElection)
router.patch('/elections/:id',authMiddleware, updateElection)
router.get('/elections/:id/candidates',authMiddleware, getCandidatesOfElection)
router.get('/elections/:id/voters',authMiddleware, getElectionVoters)

// candidates routes
router.get('/candidates/:id',authMiddleware, getCandidate)
router.post('/candidates',authMiddleware, addCandidate)
router.delete('/candidates/:id',authMiddleware, removeCandidate)
router.patch('/candidates/:id',authMiddleware, voteCandidate)
module.exports = router
