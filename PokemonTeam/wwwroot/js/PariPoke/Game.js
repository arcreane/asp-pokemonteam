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

    const selectedPokemon = document.getElementById('selectedBetPokemon').value.trim();
    const betAmount = parseInt(document.getElementById('betAmount').value, 10);

    if (!selectedPokemon || isNaN(betAmount) || betAmount <= 0) {
        alert("Pari invalide !");
        return;
    }

    console.log(`✅ Pari sur : ${selectedPokemon}, mise : ${betAmount} pokédollars`);

    // Nettoyer
    track.querySelectorAll('.runner-wrapper, .preview-runner').forEach(el => el.remove());

    const runners = [];

    for (let i = 0; i < selectedRunners.length; i++) {
        const pokeName = selectedRunners[i].trim();
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName.toLowerCase()}`);
        const data = await res.json();
        const spriteUrl = data.sprites.back_default;
        const spriteFront = data.sprites.front_default;

        const wrapper = document.createElement('div');
        wrapper.className = 'runner-wrapper';

        const img = document.createElement('img');
        img.src = spriteUrl;
        img.className = 'runner';

        if (pokeName.toLowerCase() === selectedPokemon.toLowerCase()) {
            if (window.activeBoost && window.activeBoost > 0) {
                img.classList.add('boosted-runner');
            }
        }

        wrapper.appendChild(img);
        track.appendChild(wrapper);

        runners.push({
            wrapper: wrapper,
            img: img,
            front: spriteFront,
            name: pokeName,
            strength: 50 + Math.floor(Math.random() * 20),
            defense: 30 + Math.floor(Math.random() * 20),
            healthPoint: 100,
            types: ["normal"]
        });

        const point = paths[i].getPointAtLength(startOffsets[i]);
        wrapper.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;
    }

    const steps = [...startOffsets];
    let winnerIndex = -1;

    const interval = setInterval(() => {
        let finished = false;

        for (let i = 0; i < runners.length; i++) {
            if (steps[i] >= totalLengths[i]) continue;

            let speed = 8 + Math.random() * 6;

            if (runners[i].name.toLowerCase() === selectedPokemon.toLowerCase()) {
                speed += window.activeBoost || 0;
            }

            steps[i] += speed;

            const point = paths[i].getPointAtLength(steps[i]);
            runners[i].wrapper.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;

            if (steps[i] >= totalLengths[i] && winnerIndex === -1) {
                winnerIndex = i;
                finished = true;
            }
        }

        // ⚡ Attaque random
        if (Math.random() < 0.02) {
            const attackerIndex = Math.floor(Math.random() * runners.length);
            let targetIndex = Math.floor(Math.random() * runners.length);
            while (targetIndex === attackerIndex) {
                targetIndex = Math.floor(Math.random() * runners.length);
            }

            const attacker = runners[attackerIndex];
            const target = runners[targetIndex];

            console.log(`⚡ ${attacker.name} attaque ${target.name}`);

            fetch('api/Skills/use', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Attacker: {
                        name: attacker.name,
                        strength: attacker.strength,
                        defense: attacker.defense,
                        healthPoint: attacker.healthPoint,
                        types: attacker.types
                    },
                    Target: {
                        name: target.name,
                        strength: target.strength,
                        defense: target.defense,
                        healthPoint: target.healthPoint,
                        types: target.types
                    },
                    Skill: {
                        Id: 1,
                        Name: "Tackle",
                        Damage: 10,
                        PowerPoints: 10,
                        Accuracy: 95,
                        fk_type: 1
                    }
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log(`💥 ${attacker.name} inflige ${data.damageDealt} à ${target.name}`);
                    steps[targetIndex] -= 20;

                    // ✅ Même effet que boost : on ajoute une classe temporaire
                    target.img.classList.add('attacked-runner');
                    setTimeout(() => {
                        target.img.classList.remove('attacked-runner');
                    }, 300);
                })
                .catch(err => console.error("Erreur attaque:", err));
        }

        if (finished) {
            clearInterval(interval);

            const winnerName = runners[winnerIndex].name.trim();
            const winnerSprite = runners[winnerIndex].front;

            console.log(`🏁 Gagnant : ${winnerName}`);
            console.log(`🎯 Ton pari : ${selectedPokemon}`);

            let gain = 0;
            if (winnerName.toLowerCase() === selectedPokemon.toLowerCase()) {
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
                    console.log("✅ Réponse backend:", data);
                    document.getElementById('player-balance').innerText = data.pokedollar;
                })
                .catch(error => {
                    console.error("❌ Erreur maj pokédollars:", error);
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

            track.querySelectorAll('.runner-wrapper, .preview-runner').forEach(el => el.remove());
            PreviewUtils.buildPreviewRunners(selectedRunners);
        }
    }, 50);
});
