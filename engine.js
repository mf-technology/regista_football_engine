//------------------------
//    NPM Modules
//------------------------
const common = require('./lib/common')
const setPositions = require('./lib/setPositions')
const setVariables = require('./lib/setVariables')
const playerMovement = require('./lib/playerMovement')
const ballMovement = require('./lib/ballMovement')
const validate = require('./lib/validate')
const physicsEngine = require('./lib/physicsEngine')
const eventManager = require('./lib/eventManager')
const gameLoop = require('./lib/gameLoop')

//------------------------
//    Functions
//------------------------
async function initiateGame(team1, team2, pitchDetails) {
  validate.validateArguments(team1, team2, pitchDetails)
  validate.validateTeam(team1)
  validate.validateTeam(team2)
  validate.validatePitch(pitchDetails)
  let matchDetails = setVariables.populateMatchDetails(team1, team2, pitchDetails)
  console.log(matchDetails)
  let kickOffTeam = setVariables.setGameVariables(matchDetails.kickOffTeam)
  let secondTeam = setVariables.setGameVariables(matchDetails.secondTeam)
  kickOffTeam = setVariables.koDecider(kickOffTeam, matchDetails)
  matchDetails.iterationLog.push(`Team to kick off - ${kickOffTeam.name}`)
  matchDetails.iterationLog.push(`Second team - ${secondTeam.name}`)
  setPositions.switchSide(matchDetails, secondTeam)
  matchDetails.kickOffTeam = kickOffTeam
  matchDetails.secondTeam = secondTeam
  physicsEngine.createBodies(matchDetails)
  physicsEngine.runPhysics()
  return matchDetails
}

async function playIteration(matchDetails) {
  const startTime = performance.now()

  let closestPlayerA = {
    'name': '',
    'position': 100000
  }
  let closestPlayerB = {
    'name': '',
    'position': 100000
  }
  validate.validateMatchDetails(matchDetails)
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam)
  validate.validateTeamSecondHalf(matchDetails.secondTeam)
  validate.validatePlayerPositions(matchDetails)
  matchDetails.iterationLog = []
  let { kickOffTeam, secondTeam } = matchDetails
  common.matchInjury(matchDetails, kickOffTeam)
  common.matchInjury(matchDetails, secondTeam)
  matchDetails = ballMovement.moveBall(matchDetails)
  if (matchDetails.endIteration == true) {
    delete matchDetails.endIteration
    return matchDetails
  }
  playerMovement.closestPlayerToBall(closestPlayerA, kickOffTeam, matchDetails)
  playerMovement.closestPlayerToBall(closestPlayerB, secondTeam, matchDetails)
  eventManager.handleEvent('foul', matchDetails, closestPlayerA, closestPlayerB)
  eventManager.handleEvent('penalty', matchDetails, closestPlayerA, closestPlayerB)
  eventManager.handleEvent('corner', matchDetails)
  eventManager.handleEvent('freeKick', matchDetails, closestPlayerA, closestPlayerB)
  eventManager.handleEvent('offside', matchDetails, closestPlayerA)
  kickOffTeam = playerMovement.decideMovement(closestPlayerA, kickOffTeam, secondTeam, matchDetails)
  secondTeam = playerMovement.decideMovement(closestPlayerB, secondTeam, kickOffTeam, matchDetails)
  matchDetails.kickOffTeam = kickOffTeam
  matchDetails.secondTeam = secondTeam
  if (matchDetails.ball.ballOverIterations.length == 0 || matchDetails.ball.withTeam != '') {
    playerMovement.checkOffside(kickOffTeam, secondTeam, matchDetails)
  }

  updateStatistics(matchDetails)

  const endTime = performance.now()
  console.log(`Oyun döngüsü süresi: ${endTime - startTime} ms`)
  return matchDetails
}

function updateStatistics(matchDetails) {
  const { kickOffTeam, secondTeam } = matchDetails
  
  // Temel istatistikleri güncelle
  kickOffTeam.stats = kickOffTeam.stats || {
    goals: 0,
    shots: 0,
    passes: 0,
    possession: 0
  }
  
  secondTeam.stats = secondTeam.stats || {
    goals: 0,
    shots: 0,
    passes: 0,
    possession: 0
  }
  
  // Top hangi takımdaysa possession'ı güncelle
  if (matchDetails.ball.withTeam === kickOffTeam.name) {
    kickOffTeam.stats.possession++
  } else if (matchDetails.ball.withTeam === secondTeam.name) {
    secondTeam.stats.possession++
  }
}

async function startSecondHalf(matchDetails) {
  validate.validateMatchDetails(matchDetails)
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam)
  validate.validateTeamSecondHalf(matchDetails.secondTeam)
  validate.validatePlayerPositions(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  setPositions.switchSide(matchDetails, kickOffTeam)
  setPositions.switchSide(matchDetails, secondTeam)
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setPositions.setBallSpecificGoalScoreValue(matchDetails, matchDetails.secondTeam)
  matchDetails.iterationLog = [`Second Half Started: ${matchDetails.secondTeam.name} to kick offs`]
  matchDetails.kickOffTeam.intent = `defend`
  matchDetails.secondTeam.intent = `attack`
  matchDetails.half++
  return matchDetails
}

async function startGame(team1, team2, pitchDetails) {
  try {
    const matchDetails = await initiateGame(team1, team2, pitchDetails)
    return gameLoop.run(matchDetails)
  } catch (error) {
    console.error('Oyun başlatılırken bir hata oluştu:', error)
    throw error
  }
}

module.exports = {
  initiateGame,
  playIteration,
  startSecondHalf,
  startGame
}
