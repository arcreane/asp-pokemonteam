console.log("RunnerSelection.js chargé ✔️");

const runnersContainer = document.getElementById("runnersSelection");
const selectedRunners = [];

// ✅ Charge dynamiquement depuis ton contrôleur .NET
async function loadAllPokemon() {
    try {
        const res = await fetch('/Pokemon/getAllPokemon');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const pokemons = await res.json();

        pokemons.forEach(pokemon => {
            createPokemonCard(pokemon.name);
        });

        console.log(`✅ ${pokemons.length} Pokémon chargés pour sélection.`);
    } catch (error) {
        console.error("Erreur loadAllPokemon:", error);
    }
}

// ✅ Construit une carte cliquable
function createPokemonCard(pokeName) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName.toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
            const frontSprite = data.sprites.front_default;

            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.innerHTML = `
                <img src="${frontSprite}" alt="${pokeName}" />
                <p>${pokeName}</p>
            `;

            card.addEventListener('click', () => {
                if (card.classList.contains('selected')) {
                    // Retirer sélection
                    card.classList.remove('selected');
                    const index = selectedRunners.indexOf(pokeName);
                    if (index > -1) selectedRunners.splice(index, 1);
                } else {
                    if (selectedRunners.length >= 4) {
                        alert("Tu peux sélectionner maximum 4 Pokémon !");
                        return;
                    }
                    card.classList.add('selected');
                    selectedRunners.push(pokeName);
                }

                // Reconstruire previews en live
                PreviewUtils.buildPreviewRunners(selectedRunners);
            });

            runnersContainer.appendChild(card);
        })
        .catch(err => {
            console.error(`Erreur chargement sprite pour ${pokeName}:`, err);
        });
}

// ✅ Bouton de confirmation
document.getElementById("confirmRunners").addEventListener("click", () => {
    if (selectedRunners.length !== 4) {
        alert("Choisis exactement 4 Pokémon coureurs !");
        return;
    }
    console.log("Coureurs confirmés :", selectedRunners);
});

// ✅ Lancement au chargement
loadAllPokemon();
