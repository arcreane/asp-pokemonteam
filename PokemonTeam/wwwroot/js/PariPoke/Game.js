console.log("game.js chargé ✔️");

const paths = [
    document.getElementById('trackPath1'),
    document.getElementById('trackPath2'),
    document.getElementById('trackPath3'),
    document.getElementById('trackPath4')
];

// Longueurs de base des pistes
const baseLengths = paths.map(p => p.getTotalLength());
const minLength = Math.min(...baseLengths); // Couloir le plus court
const track = document.getElementById('raceContainer');

document.getElementById('startRace').addEventListener('click', async () => {
    if (selectedRunners.length !== 4) {
        alert("Sélectionne 4 coureurs avant de démarrer !");
        return;
    }

    const selectedPokemon = document.getElementById('selectedBetPokemon').value.trim();
    const betAmount = parseInt(document.getElementById('betAmount').value, 10);
    const numRounds = parseInt(document.getElementById('numRounds').value, 10);

    if (!selectedPokemon || isNaN(betAmount) || betAmount <= 0) {
        alert("Pari invalide !");
        return;
    }

    if (isNaN(numRounds) || numRounds <= 0) {
        alert("Nombre de tours invalide !");
        return;
    }

    console.log(`✅ Pari sur : ${selectedPokemon}, mise : ${betAmount} pokédollars`);
    console.log(`🔁 Nombre de tours : ${numRounds}`);

    // Débite le pari
    try {
        const betRes = await fetch('/PariPoke/bet', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: betAmount })
        });
        if (!betRes.ok) {
            const err = await betRes.text();
            alert(`Erreur lors du pari : ${err}`);
            return;
        }
        const betData = await betRes.json();
        console.log(`✅ Nouveau solde : ${betData.pokedollar}`);
        document.getElementById('player-balance').innerText = betData.pokedollar;
    } catch (err) {
        console.error(err);
        alert("Erreur réseau lors du pari !");
        return;
    }

    // Nettoyer la piste
    track.querySelectorAll('.runner-wrapper, .preview-runner').forEach(el => el.remove());

    const runners = [];
    const totalLengths = baseLengths.map(l => l * numRounds);

    // ➜ Correction : calcul du décalage de départ pour chaque couloir
    const startOffsets = baseLengths.map(length => length - minLength);

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

        if (pokeName.toLowerCase() === selectedPokemon.toLowerCase() && window.activeBoost > 0) {
            img.classList.add('boosted-runner');
        }

        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';

        const hpFill = document.createElement('div');
        hpFill.className = 'hp-fill';
        hpBar.appendChild(hpFill);

        wrapper.appendChild(img);
        wrapper.appendChild(hpBar);
        track.appendChild(wrapper);

        runners.push({
            wrapper,
            img,
            front: spriteFront,
            name: pokeName,
            Id: i + 1,
            strength: 50 + Math.floor(Math.random() * 20),
            defense: 30 + Math.floor(Math.random() * 20),
            healthPoint: 100,
            maxHealth: 100,
            types: [{ Id: 1, Name: "Normal", Multiplier: 1.0 }],
            hpFill
        });

        // ➜ Position de départ ajustée avec décalage
        const point = paths[i].getPointAtLength(startOffsets[i]);
        wrapper.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;
    }

    // ➜ Steps commencent à l'offset
    const steps = [...startOffsets];
    let winnerIndex = -1;

    const interval = setInterval(() => {
        for (let i = 0; i < runners.length; i++) {
            if (steps[i] >= totalLengths[i]) continue;

            const baseSpeed = 8;
            const randomFactor = Math.random() * 6;
            const hpRatio = Math.max(0, runners[i].healthPoint) / runners[i].maxHealth;
            let speed = (baseSpeed + randomFactor) * hpRatio;

            if (runners[i].name.toLowerCase() === selectedPokemon.toLowerCase()) {
                speed += window.activeBoost || 0;
            }

            steps[i] += speed;

            const distance = steps[i] % baseLengths[i];
            const point = paths[i].getPointAtLength(distance);
            runners[i].wrapper.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;

            if (steps[i] >= totalLengths[i] && winnerIndex === -1) {
                winnerIndex = i;
                console.log(`✅ ${runners[i].name} a fini ses ${numRounds} tours !`);
            }
        }

        const alive = runners.filter(r => r.healthPoint > 0);
        if (Math.random() < 0.02 && alive.length >= 2) {
            let attacker = alive[Math.floor(Math.random() * alive.length)];
            let target = alive[Math.floor(Math.random() * alive.length)];
            while (target === attacker) {
                target = alive[Math.floor(Math.random() * alive.length)];
            }

            console.log(`⚡ ${attacker.name} attaque ${target.name}`);
            const damage = 10;
            target.healthPoint = Math.max(0, target.healthPoint - damage);
            target.hpFill.style.width = `${(target.healthPoint / target.maxHealth) * 100}%`;

            steps[runners.indexOf(target)] = Math.max(0, steps[runners.indexOf(target)] - 20);

            target.img.classList.add('attacked-runner');
            setTimeout(() => target.img.classList.remove('attacked-runner'), 300);
        }

        if (winnerIndex !== -1) {
            clearInterval(interval);

            const winnerName = runners[winnerIndex].name.trim();
            const winnerSprite = runners[winnerIndex].front;

            console.log(`🏁 Gagnant : ${winnerName}`);
            console.log(`🎯 Ton pari : ${selectedPokemon}`);

            let gain = 0;
            if (winnerName.toLowerCase() === selectedPokemon.toLowerCase()) {
                gain = betAmount * 2;
            }

            document.getElementById('victoryTitle').innerText = `Victoire de ${winnerName}!`;
            document.getElementById('victorySprite').src = winnerSprite;
            document.getElementById('victoryMessage').innerText = gain > 0
                ? `Bravo ! Tu remportes ${gain} pokédollars !`
                : `Dommage, tu perds ton pari.`;

            document.getElementById('victoryPopup').style.display = 'block';

            if (gain > 0) {
                fetch('/PariPoke/win', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: gain })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(`✅ Nouveau solde après gain : ${data.pokedollar}`);
                        document.getElementById('player-balance').innerText = data.pokedollar;
                    })
                    .catch(err => console.error(err));
            }

            window.activeBoost = 0;
            const boostInfo = document.getElementById('boost-info');
            if (boostInfo) boostInfo.style.display = 'none';

            track.querySelectorAll('.runner-wrapper, .preview-runner').forEach(el => el.remove());
            PreviewUtils.buildPreviewRunners(selectedRunners);
        }
    }, 50);
});
