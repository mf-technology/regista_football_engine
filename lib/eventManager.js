// Ferit Arıbulan 2025

const actions = require('./actions');

function handleEvent(eventType, matchDetails, player, thatPlayer) {
  try {
    switch (eventType) {
      case 'foul':
        actions.setFoul(matchDetails, player.team, player, thatPlayer);
        break;
      case 'penalty':
        actions.checkPenalty(matchDetails, player, thatPlayer);
        break;
      case 'corner':
        actions.checkCornerKick(matchDetails);
        break;
      case 'freeKick':
        actions.checkFreeKick(matchDetails, player, thatPlayer);
        break;
      case 'offside':
        actions.checkOffside(matchDetails, player);
        break;
      // Diğer olaylar...
    }
  } catch (error) {
    console.error(`Olay işlenirken hata oluştu: ${error.message}`);
  }
}

module.exports = {
  handleEvent
}; 