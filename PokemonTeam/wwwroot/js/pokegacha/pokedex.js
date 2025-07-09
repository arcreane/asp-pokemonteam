import { capturedPokemonIds } from "./player.js";

export function renderPokedex() {
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