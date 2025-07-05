const paths = [
document.getElementById('trackPath1'),
document.getElementById('trackPath2'),
document.getElementById('trackPath3'),
document.getElementById('trackPath4')
];
const svg = document.getElementById('raceSVG');

const totalLengths = paths.map(p => p.getTotalLength());
const maxLength = Math.max(...totalLengths);
let startOffsets = totalLengths.map(length => maxLength - length);
startOffsets = startOffsets.reverse();

const pokemons = ["pikachu", "bulbasaur", "charmander", "squirtle"];
const runners = [];

const track = document.getElementById('raceContainer');

// ✅ Charger les sprites une fois au chargement
window.addEventListener('DOMContentLoaded', async () => {
for (let i = 0; i < pokemons.length; i++) {
const pokeName = pokemons[i];
const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
const data = await res.json();
const spriteUrl = data.sprites.back_default;
const spriteFront = data.sprites.front_default;

const img = document.createElement('img');
img.src = spriteUrl;
img.className = 'runner';
track.appendChild(img);

runners.push({ img: img, front: spriteFront, name: pokeName });

// Placer chaque sprite sur sa ligne de départ
const point = paths[i].getPointAtLength(startOffsets[i]);
img.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;
}
});

document.getElementById('startRace').addEventListener('click', () => {
const selectedPokemon = document.getElementById('pokemon').value;
const mise = parseInt(document.getElementById('mise').value);

const steps = [...startOffsets];

const progressBars = [];
const progressContainer = document.getElementById('progressBars');
progressContainer.innerHTML = '';

pokemons.forEach(pokeName => {
const item = document.createElement('div');
item.className = 'progress-item';

const label = document.createElement('span');
label.className = 'progress-label';
label.innerText = pokeName;

const bar = document.createElement('div');
bar.className = 'progress-bar';

const fill = document.createElement('div');
fill.className = 'progress-fill';

bar.appendChild(fill);
item.appendChild(label);
item.appendChild(bar);
progressContainer.appendChild(item);

progressBars.push(fill);
});

let winnerIndex = -1;

const interval = setInterval(() => {
let finished = false;

for (let i = 0; i < runners.length; i++) {
if (steps[i] >= totalLengths[i]) continue;

// Vitesse pour test : même pour tous
steps[i] += 8;

const point = paths[i].getPointAtLength(steps[i]);
runners[i].img.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;

const percent = Math.min((steps[i] - startOffsets[i]) / (totalLengths[i] - startOffsets[i]) * 100, 100);
progressBars[i].style.width = percent + '%';

if (steps[i] >= totalLengths[i] && winnerIndex === -1) {
winnerIndex = i;
finished = true;
}
}

if (finished) {
clearInterval(interval);
const winnerName = runners[winnerIndex].name;
const winnerSprite = runners[winnerIndex].front;

let gain = 0;
if (selectedPokemon.toLowerCase() === winnerName) {
gain = mise;
}

    fetch('/api/player/update', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            game: "PariPoke",
            experience: 0,
            pokedollar: gain
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse backend:", data);
            // ✅ Ici tu mets à jour le DOM avec la nouvelle somme
            document.getElementById('player-balance').innerText = data.pokedollar;
        })
        .catch(error => {
            console.error("Erreur maj pokédollars:", error);
        });


document.getElementById('victoryTitle').innerText = `Victoire de ${winnerName}!`;
document.getElementById('victorySprite').src = winnerSprite;
document.getElementById('victoryMessage').innerText = gain > 0
? `Bravo ! Tu remportes ${gain} pokédollars !`
: `Dommage, tu perds ton pari.`;

document.getElementById('victoryPopup').style.display = 'block';
}
}, 50);
});

