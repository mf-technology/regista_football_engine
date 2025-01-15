// Ferit Arıbulan 2025

const common = require(`../lib/common`);
const ballMovement = require(`../lib/ballMovement`);
const setPositions = require(`../lib/setPositions`);
const actions = require(`../lib/actions`);

function decideMovement(closestPlayer, team, opp, matchDetails) {
    const allActions = [`shoot`, `throughBall`, `pass`, `cross`, `tackle`, `intercept`, `slide`, `run`, `sprint`, `clear`, `penalty`];
    const ballPosition = matchDetails.ball?.position || [0, 0];
    const players = team.players || [];

    players.forEach(thisPlayer => {
        if (!Array.isArray(thisPlayer.currentPOS) || thisPlayer.currentPOS.includes('NP')) return;

        let ballToPlayerX = thisPlayer.currentPOS[0] - ballPosition[0];
        let ballToPlayerY = thisPlayer.currentPOS[1] - ballPosition[1];
        let possibleActions = actions.findPossActions?.(thisPlayer, team, opp, ballToPlayerX, ballToPlayerY, matchDetails) || [];
        let action = actions.selectAction?.(possibleActions) || 'run';

        if (thisPlayer.hasBall && thisPlayer.skill?.shooting > 80) {
            action = 'shoot';
        }

        let move = getMovement(thisPlayer, action, opp, ballToPlayerX, ballToPlayerY, matchDetails);
        thisPlayer.currentPOS = completeMovement(matchDetails, thisPlayer.currentPOS, move);

        if (thisPlayer.hasBall) {
            handleBallPlayerActions(matchDetails, thisPlayer, team, opp, action);
        }
    });

    return team;
}

function setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp) {
    if (thisPlayer.offside) {
        matchDetails.iterationLog.push(`${thisPlayer.name} is offside`);
        if (team.name === matchDetails.kickOffTeam.name) setPositions.setSetpieceKickOffTeam(matchDetails);
        else setPositions.setSetpieceSecondTeam(matchDetails);
    } else {
        thisPlayer.hasBall = true;
        matchDetails.ball.lastTouch = {
            playerName: thisPlayer.name,
            playerID: thisPlayer.playerID,
            teamID: team.teamID
        };
        matchDetails.ball.ballOverIterations = [];
        matchDetails.ball.position = [...thisPlayer.currentPOS];
        matchDetails.ball.Player = thisPlayer.playerID;
        matchDetails.ball.withPlayer = true;
        matchDetails.ball.withTeam = team.teamID;
        team.intent = `attack`;
        opp.intent = `defend`;
    }
}

function completeMovement(matchDetails, currentPOS, move) {
    if (currentPOS[0] !== 'NP') {
        const pitchSize = matchDetails.pitchSize || [100, 50];
        let intendedMovementX = currentPOS[0] + move[0];
        let intendedMovementY = currentPOS[1] + move[1];

        if (intendedMovementX < pitchSize[0] + 1 && intendedMovementX > -1) currentPOS[0] += move[0];
        if (intendedMovementY < pitchSize[1] + 1 && intendedMovementY > -1) currentPOS[1] += move[1];
    }
    return currentPOS;
}

function checkOffside(matchDetails, player) {
    const lastDefenderX = matchDetails.lastDefender?.x || 0;
    const lastDefenderY = matchDetails.lastDefender?.y || 0;

    if (isOffside(player, lastDefenderX, lastDefenderY)) {
        player.offside = true;
        matchDetails.iterationLog.push(`${player.name} is offside.`);
    } else {
        player.offside = false;
    }
}

function isOffside(player, lastDefenderX, lastDefenderY) {
    if (!Array.isArray(player.currentPOS)) return false;
    return player.currentPOS[0] > lastDefenderX && player.currentPOS[1] < lastDefenderY;
}

function handleBallPlayerActions(matchDetails, thisPlayer, team, opp, action) {
    const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`];
    ballMovement.getBallDirection(matchDetails, thisPlayer.currentPOS);
    matchDetails.ball.position = [...thisPlayer.currentPOS, 0];

    if (ballActions.includes(action)) {
        ballMoved(matchDetails, thisPlayer, team, opp);
        let newPosition;

        switch (action) {
            case 'cleared':
            case 'boot':
                newPosition = ballMovement.ballKicked(matchDetails, team, thisPlayer);
                break;
            case 'pass':
                newPosition = ballMovement.ballPassed(matchDetails, team, thisPlayer);
                break;
            case 'cross':
                newPosition = ballMovement.ballCrossed(matchDetails, team, thisPlayer);
                break;
            case 'throughBall':
                newPosition = ballMovement.throughBall(matchDetails, team, thisPlayer);
                break;
            case 'shoot':
                newPosition = ballMovement.shotMade(matchDetails, team, thisPlayer);
                break;
            case 'penalty':
                newPosition = ballMovement.penaltyTaken(matchDetails, team, thisPlayer);
                break;
        }

        if (newPosition) {
            matchDetails.iterationLog.push(`${action} to new position: ${newPosition}`);
            updateInformation(matchDetails, newPosition);
        }
    }
}

function ballMoved(matchDetails, thisPlayer, team, opp) {
    thisPlayer.hasBall = false;
    matchDetails.ball.withPlayer = false;
    team.intent = `attack`;
    opp.intent = `attack`;
    matchDetails.ball.Player = ``;
    matchDetails.ball.withTeam = ``;
}

function updateInformation(matchDetails, newPosition) {
    if (!matchDetails.endIteration) {
        matchDetails.ball.position = [...newPosition, 0];
    }
}

function closestPlayerToBall(closestPlayer, team, matchDetails) {
  let closestPlayerDetails
  let { position } = matchDetails.ball
  for (let thisPlayer of team.players) {
    let ballToPlayerX = Math.abs(thisPlayer.currentPOS[0] - position[0])
    let ballToPlayerY = Math.abs(thisPlayer.currentPOS[1] - position[1])
    let proximityToBall = ballToPlayerX + ballToPlayerY
    if (proximityToBall < closestPlayer.position) {
      closestPlayer.name = thisPlayer.name
      closestPlayer.position = proximityToBall
      closestPlayerDetails = thisPlayer
    }
  }

  setPositions.setIntentPosition(matchDetails, closestPlayerDetails)
  matchDetails.iterationLog.push(`Closest Player to ball: ${closestPlayerDetails.name}`)
}

function getMovement(player, action, opposition, ballX, ballY, matchDetails) {
  const { position } = matchDetails.ball
  const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`]
  if (action === `wait` || ballActions.includes(action)) return [0, 0]
  else if (action === `tackle` || action === `slide`) {
    return getTackleMovement(ballX, ballY)
  } else if (action === `intercept`) {
    return getInterceptMovement(player, opposition, position, matchDetails.pitchSize)
  } else if (action === `run`) {
    return getRunMovement(matchDetails, player, ballX, ballY)
  } else if (action === `sprint`) {
    return getSprintMovement(matchDetails, player, ballX, ballY)
  }
}

module.exports = {
    decideMovement,
    setClosePlayerTakesBall,
    completeMovement,
    checkOffside,
    isOffside,
    handleBallPlayerActions,
    ballMoved,
    updateInformation,
    closestPlayerToBall,
    getMovement
};
