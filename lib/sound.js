// Ferit Arıbulan 2025

const sounds = {
  goal: new Audio('sounds/goal.mp3'),
  foul: new Audio('sounds/foul.mp3'),
  whistle: new Audio('sounds/whistle.mp3')
};

function playSound(sound) {
  return new Promise((resolve) => {
    sounds[sound].play();
    sounds[sound].onended = resolve;
  });
}

module.exports = {
  playSound
}; 