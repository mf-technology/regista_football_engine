// Ferit Arıbulan 2025

const actions = require('./actions');

function handleEvent(eventType, matchDetails, player, thatPlayer) {
  try {
    if (!matchDetails || !player) {
      throw new Error('Gerekli parametreler eksik');
    }

    let result;
    switch (eventType) {
      case 'foul':
        if (!thatPlayer) throw new Error('Faul için ikinci oyuncu gerekli');
        result = actions.setFoul(matchDetails, player.team, player, thatPlayer);
        break;
      case 'penalty':
        result = actions.checkPenalty(matchDetails, player, thatPlayer);
        break;
      case 'corner':
        result = actions.checkCornerKick(matchDetails);
        break;
      case 'freeKick':
        result = actions.checkFreeKick(matchDetails, player, thatPlayer);
        break;
      case 'offside':
        if (typeof actions.checkOffside !== 'function') {
          throw new Error('Ofsayt kontrolü henüz implement edilmemiş');
        }
        result = actions.checkOffside(matchDetails, player);
        break;
      // Diğer olaylar...
    }

    return result;
  } catch (error) {
    console.error(`Olay işlenirken hata oluştu: ${error.message}`);
    console.error('Hata detayları:', {
      eventType,
      playerInfo: player ? player.id : 'tanımsız',
      matchDetailsInfo: matchDetails ? matchDetails.id : 'tanımsız'
    });
    throw error;
  }
}

module.exports = {
  handleEvent
}; 