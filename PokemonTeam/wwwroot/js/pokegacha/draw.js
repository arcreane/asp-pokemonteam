import { currentPokedollar, capturedPokemonIds } from "./player.js";
import { renderPokedex } from "./pokedex.js";

export function initDraw() {
    const drawButton = document.getElementById("draw");
    const loading = document.getElementById("loading");
    const sound = document.getElementById("gachaSound");
    const game = "pokeGacha";

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
                            <div class="stat-item"><div class="stat-label">HP</div><div class="stat-value">${pokemon.healthPoint}</div></div>
                            <div class="stat-item"><div class="stat-label">ATK</div><div class="stat-value">${pokemon.strength}</div></div>
                            <div class="stat-item"><div class="stat-label">DEF</div><div class="stat-value">${pokemon.defense}</div></div>
                            <div class="stat-item"><div class="stat-label">SPD</div><div class="stat-value">${pokemon.speed}</div></div>
                        </div>
                    </div>
                `;

                document.getElementById("pokedollar").textContent = data.pokedollar;

                fetch("/Pokemon/addPokemonToPlayer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pokemonId: pokemon.id, game })
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
}