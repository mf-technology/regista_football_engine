const { Engine, Render, World, Bodies } = require('matter-js');

const engine = Engine.create();
const render = Render.create({
  element: document.body,
  engine: engine
});

// Top ve oyuncular için cisimler oluştur
function createBodies(matchDetails) {
  const ball = Bodies.circle(matchDetails.ball.position[0], matchDetails.ball.position[1], 10);
  World.add(engine.world, [ball]);
  return ball;
}

function runPhysics() {
  Engine.run(engine);
  Render.run(render);
  // Olay dinleyicilerini burada etkinleştir
  Matter.Events.on(engine, 'collisionStart', function(event) {
    // Çarpışma işlemleri
  });
}

module.exports = {
  createBodies,
  runPhysics
}; 