const { Engine, World, Bodies, Events } = require('matter-js');

// Fizik motorunu oluştur
const engine = Engine.create();

// Top ve oyuncular için cisimler oluştur
function createBodies(matchDetails) {
    const ball = Bodies.circle(matchDetails.ball.position[0], matchDetails.ball.position[1], 10, {
        label: 'ball',
        density: 0.001,
        friction: 0.1,
        restitution: 0.8
    });

    World.add(engine.world, [ball]);

    const teams = [matchDetails.kickOffTeam, matchDetails.secondTeam];
    teams.forEach(team => {
        team.players.forEach(player => {
            const playerBody = Bodies.rectangle(player.position[0], player.position[1], 20, 40, {
                label: `${team.name}_${player.id}`
            });
            World.add(engine.world, playerBody);
        });
    });

    return ball;
}

// Çarpışma olaylarını işlemek için fonksiyon
function handleCollision(event) {
    event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('ball') && labels.some(label => label.startsWith('team'))) {
            console.log(`Çarpışma: ${pair.bodyA.label} ve ${pair.bodyB.label}`);
        }
    });
}

// Fizik motorunu manuel çalıştıran döngü
function runPhysics() {
    // Çarpışma olaylarını dinleyiciye bağla
    Events.on(engine, 'collisionStart', handleCollision);

    // Manuel güncelleme döngüsü
    function gameLoop() {
        Engine.update(engine, 1000 / 60); // 60 FPS ile güncelle
        setTimeout(gameLoop, 1000 / 60); // Node.js'te döngüyü sürdür
    }

    console.log('Fizik motoru çalıştırılıyor...');
    gameLoop(); // Döngüyü başlat
}

// Modülü dışa aktar
module.exports = {
    createBodies,
    runPhysics
};
