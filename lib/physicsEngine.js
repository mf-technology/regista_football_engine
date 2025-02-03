const { Engine, World, Bodies, Events } = require('matter-js');

// Fizik motorunu oluştur
const engine = Engine.create();

// Top ve oyuncular için cisimler oluştur
function createBodies(matchDetails) {
    const ball = Bodies.circle(matchDetails.ball.position[0], matchDetails.ball.position[1], 10, {
        label: 'ball',
        density: 0.001,
        friction: 0.1,
        restitution: 0.8,
        frictionAir: 0.02  // Add air friction for more realistic movement
    });

    World.add(engine.world, [ball]);

    const teams = [matchDetails.kickOffTeam, matchDetails.secondTeam];
    teams.forEach(team => {
        team.players.forEach(player => {
            const playerBody = Bodies.rectangle(player.position[0], player.position[1], 20, 40, {
                label: `${team.name}_${player.id}`,
                density: 0.002,
                friction: 0.5,
                frictionAir: 0.05,
                inertia: Infinity  // Prevents rotation
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

// Add new function to update positions
function updatePositions(matchDetails) {
    const bodies = engine.world.bodies;
    
    bodies.forEach(body => {
        if (body.label === 'ball') {
            matchDetails.ball.position = [body.position.x, body.position.y];
        } else if (body.label.startsWith('team')) {
            const [teamName, playerId] = body.label.split('_');
            const team = teamName === matchDetails.kickOffTeam.name ? 
                matchDetails.kickOffTeam : matchDetails.secondTeam;
            const player = team.players.find(p => p.id === playerId);
            if (player) {
                player.position = [body.position.x, body.position.y];
            }
        }
    });
}

// Fizik motorunu manuel çalıştıran döngü
function runPhysics(matchDetails) {
    if (!matchDetails || !matchDetails.ball) {
        throw new Error('matchDetails veya matchDetails.ball tanımlı değil');
    }

    // Çarpışma olaylarını dinleyiciye bağla
    Events.on(engine, 'collisionStart', handleCollision);

    // Manuel güncelleme döngüsü
    function gameLoop() {
        Engine.update(engine, 1000 / 60);
        updatePositions(matchDetails);  // Update positions after each physics step
        setTimeout(gameLoop, 1000 / 60);
    }

    console.log('Fizik motoru çalıştırılıyor...');
    gameLoop(); // Döngüyü başlat
}

// Modülü dışa aktar
module.exports = {
    createBodies,
    runPhysics,
    updatePositions  // Export the new function
};
