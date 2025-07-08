const SAVE_KEY        = "playerTeam";         // clé de sauvegarde
const MAX_TEAM_SIZE   = 3;                   // ajuste si besoin
const POKEMON_API     = "/Pokemon/getAllPokemon";
const GAME_NAME       = "pokeRogue";         // ✅ Ajout de la constante game

let allPokemons = [];  // stockage global pour accès facile

/* ---------- Chargement initial ---------- */
window.addEventListener("DOMContentLoaded", () => {
    playerReady
        .then(async () => {
            loadPlayerSummary(GAME_NAME)
            const playerXp = await getPlayerXP();          // XP du joueur
            let pokemons  = await fetchPokemons();         // Pokémon + stats

            pokemons = await addSprites(pokemons);         // + sprites
            allPokemons = pokemons;  // sauvegarde globale
            renderPokemonList(pokemons, playerXp);
            attachValidationButton(pokemons, playerXp);
        })
        .catch(err => console.error("❌ playerReady :", err));
});

/* ---------- Récupère l'XP du joueur ---------- */
async function getPlayerXP() {
    try {
        const res = await fetch(`/api/player/me?game=${GAME_NAME}`, { credentials: "include" });
        if (!res.ok) throw new Error(res.status);
        const player = await res.json();
        return player.experience ?? 0;
    } catch {
        return 0;   // pas trouvé ⇒ XP 0
    }
}

/* ---------- Récupère la liste des Pokémon ---------- */
async function fetchPokemons() {
    const res = await fetch(POKEMON_API);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
}

/* ---------- Ajoute l'URL du sprite PokeAPI à chaque Pokémon ---------- */
async function addSprites(list) {
    return await Promise.all(
        list.map(async p => {
            try {
                const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
                if (pokeRes.ok) {
                    const data   = await pokeRes.json();
                    p.sprite     = data.sprites.front_default ?? null;
                }
            } catch { /* ignore */ }
            return p;
        })
    );
}

/* ---------- Affiche les cartes ---------- */
function renderPokemonList(list, playerXp) {
    const box = document.getElementById("pokemon-list");
    box.innerHTML = "";

    list.forEach(p => {
        const locked = playerXp < p.unlockedXp;

        const card       = document.createElement("div");
        card.className   = "pokemon-card mb-2" + (locked ? " locked" : "");
        card.dataset.name = p.name;

        card.innerHTML = `
            ${p.sprite ? `<img src="${p.sprite}" alt="${p.name}" class="poke-img mb-1">` : ""}
            <strong>${p.name}</strong>
            <br>PV : ${p.healthPoint}/${p.maxHealthPoint}
            ${locked ? `<span class="badge bg-secondary lock-badge">🔒 XP ${p.unlockedXp}</span>`
            : `<span class="badge bg-info text-dark mb-1">XP ${p.unlockedXp}</span>`}
        `;

        if (!locked) {
            card.addEventListener("click", () => toggleSelect(card));
        }
        box.appendChild(card);
    });
}

/* ---------- Sélection / désélection ---------- */
function toggleSelect(card) {
    console.log("toggleSelect called for:", card.dataset.name);
    card.classList.toggle("selected");
    const sel = document.querySelectorAll(".pokemon-card.selected");
    if (sel.length > MAX_TEAM_SIZE) {
        sel[0].classList.remove("selected");
    }
    console.log("Selected cards count:", sel.length);
    updateSelectedBar();
}

/* ---------- Met à jour la barre de Pokémon sélectionnés ---------- */
function updateSelectedBar() {
    const selectedCards = document.querySelectorAll(".pokemon-card.selected");
    const selectedBar = document.getElementById("selected-pokemon-list");

    console.log("updateSelectedBar called, selectedCards length:", selectedCards.length);
    console.log("selectedBar element:", selectedBar);

    if (selectedCards.length === 0) {
        selectedBar.innerHTML = '<span class="text-muted">Aucun Pokémon sélectionné</span>';
        return;
    }

    selectedBar.innerHTML = "";

    selectedCards.forEach(card => {
        const pokemonName = card.dataset.name;
        const pokemon = allPokemons.find(p => p.name === pokemonName);

        console.log("Processing pokemon:", pokemonName, "Found:", !!pokemon);

        if (pokemon) {
            const miniCard = document.createElement("div");
            miniCard.className = "selected-pokemon-mini";
            miniCard.dataset.name = pokemonName;

            miniCard.innerHTML = `
                ${pokemon.sprite ? `<img src="${pokemon.sprite}" alt="${pokemon.name}">` : ""}
                <span>${pokemon.name}</span>
                <span class="remove-btn" title="Retirer de la sélection">×</span>
            `;

            // Événement pour retirer le Pokémon de la sélection
            miniCard.addEventListener("click", (e) => {
                e.stopPropagation();
                removePokemonFromSelection(pokemonName);
            });

            selectedBar.appendChild(miniCard);
            console.log("Mini card added for:", pokemonName);
        }
    });
}

/* ---------- Retire un Pokémon de la sélection ---------- */
function removePokemonFromSelection(pokemonName) {
    const card = document.querySelector(`.pokemon-card[data-name="${pokemonName}"]`);
    if (card) {
        card.classList.remove("selected");
        updateSelectedBar();
    }
}

/* ---------- Validation ---------- */
function attachValidationButton(pokemons) {
    document
        .getElementById("validate-team")
        .addEventListener("click", () => {

            /* Récupère les noms cochés ------------------------ */
            const selectedNames = [...document.querySelectorAll(".pokemon-card.selected")]
                .map(c => c.dataset.name);

            /* Vérifs ----------------------------------------- */
            if (selectedNames.length === 0) {
                return alert("Sélectionnez au moins un Pokémon !");
            }
            if (selectedNames.length > MAX_TEAM_SIZE) {
                return alert(`Pas plus de ${MAX_TEAM_SIZE} Pokémon.`);
            }

            /* -----------------------------------------------
               On sauve UNIQUEMENT les noms (ex : ["Pikachu","Eevee"])
               ----------------------------------------------- */
            localStorage.setItem("playerTeam", JSON.stringify(selectedNames));

            /* Redirection vers le combat --------------------- */
            window.location.href = "/PokeRogue/Combat";
        });
}