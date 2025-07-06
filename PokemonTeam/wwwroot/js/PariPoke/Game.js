console.log("game.js chargé ✔️");

const paths = [
    document.getElementById('trackPath1'),
    document.getElementById('trackPath2'),
    document.getElementById('trackPath3'),
    document.getElementById('trackPath4')
];

const track = document.getElementById('raceContainer');

const totalLengths = paths.map(p => p.getTotalLength());
const maxLength = Math.max(...totalLengths);
let startOffsets = totalLengths.map(length => maxLength - length).reverse();

document.getElementById('startRace').addEventListener('click', async () => {
    if (selectedRunners.length !== 4) {
        alert("Sélectionne 4 coureurs avant de démarrer !");
        return;
    }

    const selectedPokemon = document.getElementById('selectedBetPokemon').value;
    const betAmount = parseInt(document.getElementById('betAmount').value, 10);

    if (!selectedPokemon || isNaN(betAmount) || betAmount <= 0) {
        alert("Pari invalide !");
        return;
    }

    // Nettoyer runners et previews
    track.querySelectorAll('.runner, .preview-runner').forEach(img => img.remove());

    const runners = [];

    // Placer les vrais coureurs
    for (let i = 0; i < selectedRunners.length; i++) {
        const pokeName = selectedRunners[i];
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
        const data = await res.json();
        const spriteUrl = data.sprites.back_default;
        const spriteFront = data.sprites.front_default;

        const img = document.createElement('img');
        img.src = spriteUrl;
        img.className = 'runner';

        if (pokeName.toLowerCase() === selectedPokemon.toLowerCase()) {
            if (window.activeBoost && window.activeBoost > 0) {
                img.classList.add('boosted-runner');
            }
        }

        track.appendChild(img);

        runners.push({ img: img, front: spriteFront, name: pokeName });

        const point = paths[i].getPointAtLength(startOffsets[i]);
        img.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;
    }

    const steps = [...startOffsets];
    let winnerIndex = -1;

    const interval = setInterval(() => {
        let finished = false;

        for (let i = 0; i < runners.length; i++) {
            if (steps[i] >= totalLengths[i]) continue;

            // Vitesse de base
            let baseSpeed = 8;

            // Ajoute un facteur random à CHAQUE STEP
            let randomFactor = Math.random() * 6;
            let speed = baseSpeed + randomFactor;

            // Ajoute boost si c'est le Pokémon sélectionné
            if (runners[i].name.toLowerCase() === selectedPokemon.toLowerCase()) {
                speed += window.activeBoost || 0;
            }

            steps[i] += speed;

            const point = paths[i].getPointAtLength(steps[i]);
            runners[i].img.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;

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
                gain = betAmount;
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

            window.activeBoost = 0;

            const boostInfo = document.getElementById('boost-info');
            if (boostInfo) {
                boostInfo.style.display = 'none';
            }

            // Clean tout puis reconstruire
            track.querySelectorAll('.runner, .preview-runner').forEach(img => img.remove());
            PreviewUtils.buildPreviewRunners(selectedRunners);
        }
    }, 50);

});
