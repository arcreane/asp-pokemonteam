const SAVE_KEY        = "playerTeam";         // clé de sauvegarde
const MAX_TEAM_SIZE   = 3;                   // ajuste si besoin
const POKEMON_API     = "/Pokemon/getAllPokemon";

/* ---------- Chargement initial ---------- */
window.addEventListener("DOMContentLoaded", () => {
    playerReady
        .then(async () => {
            loadPlayerSummary(game)
            const playerXp = await getPlayerXP();          // XP du joueur
            let pokemons  = await fetchPokemons();         // Pokémon + stats

            pokemons = await addSprites(pokemons);         // + sprites
            renderPokemonList(pokemons, playerXp);
            attachValidationButton(pokemons, playerXp);
        })
        .catch(err => console.error("❌ playerReady :", err));
});

/* ---------- Récupère l’XP du joueur ---------- */
async function getPlayerXP() {
    try {
        const res = await fetch(`/api/player/me?game=${game}`, { credentials: "include" });
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

/* ---------- Ajoute l’URL du sprite PokeAPI à chaque Pokémon ---------- */
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
    card.classList.toggle("selected");
    const sel = document.querySelectorAll(".pokemon-card.selected");
    if (sel.length > MAX_TEAM_SIZE) sel[0].classList.remove("selected");
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