// Ferit Arıbulan 2025

const actions = require('./actions');

function handleEvent(eventType, matchDetails, player, thatPlayer) {
  try {
    if (!matchDetails || !player) {
      throw new Error('Gerekli parametreler eksik');
    }

    switch (eventType) {
      case 'foul':
        if (!thatPlayer) throw new Error('Faul için ikinci oyuncu gerekli');
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
        if (typeof actions.checkOffside !== 'function') {
          throw new Error('Ofsayt kontrolü henüz implement edilmemiş');
        }
        actions.checkOffside(matchDetails, player);
        break;
      // Diğer olaylar...
    }
  } catch (error) {
    console.error(`Olay işlenirken hata oluştu: ${error.message}`);
    console.error('Hata detayları:', {
      eventType,
      playerInfo: player ? player.id : 'tanımsız',
      matchDetailsInfo: matchDetails ? matchDetails.id : 'tanımsız'
    });
  }
}

module.exports = {
  handleEvent
}; 