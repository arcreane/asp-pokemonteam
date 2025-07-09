const game = "pokeGacha";
let currentPokedollar = 0;
let capturedPokemonIds = [];

function renderPokedex() {
    const container = document.getElementById("pokedexGrid");
    container.innerHTML = "";
    container.style.display = "grid";
    document.getElementById("pokedexLoading").style.display = "none";

    for (let id = 1; id <= 151; id++) {
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        const isCaptured = capturedPokemonIds.includes(id);
        container.innerHTML += `
            <img src="${spriteUrl}"
                 class="pokedex-sprite"
                 style="filter:${isCaptured ? 'none' : 'grayscale(100%)'}"
                 alt="pokemon ${id}" />
        `;
    }
}

window.addEventListener("load", () => {
    fetch(`/api/player/me?game=${game}`)
        .then(res => {
            if (res.status === 404) {
                return fetch("/api/player/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: `${game}-player`, game: game })
                }).then(r => r.json());
            } else if (!res.ok) {
                throw new Error("Erreur lors de la récupération du joueur");
            } else {
                return res.json();
            }
        })
        .then(player => {
            document.getElementById("pokedollar").textContent = player.pokedollar;
            currentPokedollar = player.pokedollar;
            return fetch("/PokeGacha/CapturedByMe");
        })
        .then(res => {
            if (!res.ok) throw new Error("Cannot load the pokédex.");
            return res.json();
        })
        .then(ids => {
            capturedPokemonIds = ids;
            renderPokedex();
        })
        .catch(err => {
            console.error(err);
            document.getElementById("pokedexLoading").innerHTML = `<p style="color:red">Error while loading Pokédex</p>`;
        });
});

const drawButton = document.getElementById("draw");
const loading = document.getElementById("loading");
const sound = document.getElementById("gachaSound");

drawButton.addEventListener("click", () => {
    if (currentPokedollar < 10) {
        alert("Not enough pokédollars !");
        return;
    }

    loading.style.display = "block";

    fetch(`/PokeGacha/Pull`, { method: "POST" })
        .then(res => {
            if (!res.ok) throw new Error("Not enough pokédollars !");
            return res.json();
        })
        .then(data => {
            sound.play();
            const pokemon = data.pokemon;
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

            document.getElementById("result").innerHTML = `
                <div class="pokemon-card">
                    <h3 class="pokemon-name">${pokemon.name}</h3>
                    <img src="${spriteUrl}" alt="${pokemon.name}" class="pokemon-image" />
                    <div class="pokemon-stats">
                        <div class="stat-item">
                            <div class="stat-label">HP</div>
                            <div class="stat-value">${pokemon.healthPoint}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">ATK</div>
                            <div class="stat-value">${pokemon.strength}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">DEF</div>
                            <div class="stat-value">${pokemon.defense}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">SPD</div>
                            <div class="stat-value">${pokemon.speed}</div>
                        </div>
                    </div>
                </div>
            `;

            currentPokedollar = data.pokedollar;
            document.getElementById("pokedollar").textContent = data.pokedollar;

            fetch("/Pokemon/addPokemonToPlayer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemonId: pokemon.id, game: game })
            })
                .then(() => {
                    if (!capturedPokemonIds.includes(pokemon.id)) {
                        capturedPokemonIds.push(pokemon.id);
                        renderPokedex();
                    }
                })
                .catch(err => console.error("Error association player/pokemon:", err));
        })
        .catch(err => alert(err.message))
        .finally(() => loading.style.display = "none");
});

const fightBtn = document.getElementById("fightBtn");
const fightSound = document.getElementById("fightSound");
const victorySound = document.getElementById("victorySound");

fightBtn.addEventListener("click", () => {
    fightSound.pause();
    fightSound.currentTime = 0;
    fightSound.play();
    fightBtn.disabled = true;
    fightBtn.textContent = "⚔️ Ongoing fight...";
    document.getElementById("battleLog").innerHTML = "";

    fetch("/PokeGacha/StartBattle", { method: "POST" })
        .then(res => res.json())
        .then(data => {
            const logElement = document.getElementById("battleLog");
            let i = 0;

            document.getElementById("playerSprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.playerPokemonId}.png`;
            document.getElementById("enemySprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.enemyPokemonId}.png`;

            const interval = setInterval(() => {
                if (i >= data.history.length) {
                    clearInterval(interval);
                    fightBtn.disabled = false;
                    fightBtn.textContent = "⚔️ Fight!";
                    document.getElementById("pokedollar").textContent = data.currentPokedollar;
                    currentPokedollar = data.currentPokedollar;
                    const lastLine = data.history[data.history.length - 1];
                    fightSound.pause();
                    fightSound.currentTime = 0;
                    if (lastLine.includes("won") && lastLine.includes("style='color:green'")) {
                        victorySound.play();
                    }
                    return;
                }

                const line = document.createElement("div");
                line.innerHTML = data.history[i];
                logElement.appendChild(line);
                logElement.scrollTop = logElement.scrollHeight;

                const playerStarts = data.playerStarts;
                if (i > 0 && !line.innerHTML.includes("won")) {
                    if ((i % 2 === 1 && playerStarts) || (i % 2 === 0 && !playerStarts)) {
                        const sprite = document.getElementById("playerSprite");
                        sprite.style.animation = "chargeReverse 0.5s forwards";
                        setTimeout(() => sprite.style.animation = "", 500);
                    } else {
                        const sprite = document.getElementById("enemySprite");
                        sprite.style.animation = "charge 0.5s forwards";
                        setTimeout(() => sprite.style.animation = "", 500);
                    }
                }

                i++;
            }, 1000);
        })
        .catch(err => alert(err.message));
});