// Ferit Arıbulan 2025

const eventManager = require('./eventManager');
const actions = require('./actions');

function run(matchDetails) {
  // Oyun döngüsü
  setInterval(() => {
    playIteration(matchDetails);
  }, 1000 / 60); // 60 FPS
}

async function playIteration(matchDetails) {
  const startTime = performance.now();

  // Olayları kontrol et
  eventManager.handleEvent('foul', matchDetails, closestPlayerA, closestPlayerB);
  eventManager.handleEvent('penalty', matchDetails, closestPlayerA, closestPlayerB);
  eventManager.handleEvent('corner', matchDetails);
  eventManager.handleEvent('freeKick', matchDetails, closestPlayerA, closestPlayerB);
  eventManager.handleEvent('offside', matchDetails, closestPlayerA);

  // İstatistik güncellemeleri
  updateStatistics(matchDetails);

  const endTime = performance.now();
  console.log(`Oyun döngüsü süresi: ${endTime - startTime} ms`);
}

module.exports = {
  run
}; 