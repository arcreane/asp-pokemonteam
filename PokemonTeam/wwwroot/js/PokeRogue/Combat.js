/*  ==========================================================================
    Combat.js
    --------------------------------------------------------------------------
    - Charge la sauvegarde éventuelle
    - Récupère les Pokémon + ajoute les sprites officiels (PokeAPI)
    - Gère l’affichage, la sélection, les attaques et la sauvegarde locale
    ========================================================================== */

/* -------------------  Constantes & helpers  -------------------------------- */
const SAVE_KEY   = "pokerogueSave";
const POKE_API   = "https://pokeapi.co/api/v2/pokemon/";

/* Petite fonction utilitaire pour attendre qq ms (pour les effets) */
const wait = ms => new Promise(r => setTimeout(r, ms));

/* -------------------  Chargement initial  ---------------------------------- */
window.addEventListener("DOMContentLoaded", async () => {
    console.log("combat.js chargé ✅");

    /* Vérifie l’auth + charge le résumé joueur dans l’entête  */
    try {
        await playerReady;
        await loadPlayerSummary(game);
    } catch {
        alert("Connecte-toi d’abord !");
        return (window.location.href = "/");
    }

    /* ------------------- 1. Récupère la team du joueur --------------------- */
    const teamNames = JSON.parse(localStorage.getItem("playerTeam"));
    if (!teamNames) {
        alert("Aucune équipe choisie !");
        return (window.location.href = "/PokeRogue/SelectTeam");
    }

    /* ------------------- 2. Charge tous les Pokémon ------------------------ */
    const all = await fetch("/Pokemon/getAllPokemon").then(r => r.json());

    /* 2.a → Team joueur et team ennemie */
    const playerTeam = all.filter(p => teamNames.includes(p.name));
    const enemyTeam  = shuffle([...all]).slice(0, 3);

    /* 2.b → Ajoute le sprite à chaque Pokémon (PokeAPI) */
    await addSprites([...playerTeam, ...enemyTeam]);

    /* ------------------- 3. Variables de combat --------------------------- */
    let currentPlayer = playerTeam[0];
    let currentEnemy  = enemyTeam[0];


    /* Raccourcis DOM */
    const $playerBox   = document.getElementById("playerTeam");
    const $enemyBox    = document.getElementById("enemyTeam");
    const $log         = document.getElementById("battleLog");
    const $skillsPanel = document.getElementById("skillsPanel");
    const $actionPanel = document.getElementById("actionPanel");

    const saveGame = () => {
        const data = {
            team : playerTeam.map(p => ({
                name         : p.name,
                healthPoint  : p.healthPoint,
                maxHealthPoint: p.maxHealthPoint,
                skills       : [...p.skills],     // on copie le tableau
                types        : [...p.types],
                sprite       : p.sprite           // pratique pour éviter un 2ᵉ appel PokeAPI
            })),
            enemy: {
                name          : currentEnemy.name,
                healthPoint   : currentEnemy.healthPoint,
                maxHealthPoint: currentEnemy.maxHealthPoint,
                sprite        : currentEnemy.sprite
            }
            // tu peux rajouter d’autres champs si besoin (argent, xp, tour, etc.)
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        console.log("💾 Sauvegarde complète effectuée");
    };

    /* ------------------------------------------------------------------
       Restaure toutes les stats si une sauvegarde existe
    ------------------------------------------------------------------ */
    const loadGame = () => {
        const raw = localStorage.getItem(SAVE_KEY);
        console.log(raw);
        if (!raw) return;

        try {
            const save = JSON.parse(raw);

            /* --- Player team --- */
            save.team.forEach(stored => {
                const poke = playerTeam.find(p => p.name === stored.name);
                console.log(poke)
                if (poke) {
                    Object.assign(poke, stored);   // copie toutes les propriétés
                }
            });

            /* --- Enemy --- */
            if (save.enemy) {
                const e = enemyTeam.find(x => x.name === save.enemy.name);
                if (e) Object.assign(e, save.enemy), currentEnemy = e;
            }

            console.log("✅ Sauvegarde complète restaurée");
        } catch (err) {
            console.warn("Sauvegarde corrompue :", err);
        }
    };
    
    loadGame() /* ← restaure les stats si une sauvegarde existe */

    /* ------------------- 5. Rendu ----------------------------------------- */
    function renderTeams() {
        $playerBox.innerHTML = "";
        $enemyBox.innerHTML  = "";

        /* Cartes joueur */
        playerTeam.forEach(p => {
            $playerBox.appendChild(makeCard(p, p === currentPlayer, true));
        });

        /* Cartes ennemies */
        enemyTeam.forEach(p => {
            $enemyBox.appendChild(makeCard(p, p === currentEnemy, false));
        });
    }

    function makeCard(pokemon, active, isPlayerSide) {
        const div = document.createElement("div");
        div.className = `pokemon-card ${active ? "active" : ""}`;
        div.dataset.name = pokemon.name;

        div.innerHTML = `
            ${pokemon.sprite ? `<img src="${pokemon.sprite}" class="poke-img">` : ""}
            <strong>${pokemon.name}</strong><br>
            <small>${pokemon.types.join("/")}</small><br>
            PV&nbsp;: ${pokemon.healthPoint}/${pokemon.maxHealthPoint}
        `;

        if (isPlayerSide && pokemon.healthPoint > 0) {
            div.addEventListener("click", () => {
                if (pokemon !== currentPlayer) {
                    currentPlayer = pokemon;
                    log(`🟠 Vous envoyez ${pokemon.name} !`);
                    renderTeams();
                    renderSkills();
                }
            });
        }
        return div;
    }

    function renderSkills() {
        $skillsPanel.innerHTML = "";
        currentPlayer.skills.forEach(s => {
            const b = document.createElement("button");
            b.className = "btn btn-primary me-2 mb-2";
            b.textContent = s;
            b.onclick = () => performAttack(s);
            $skillsPanel.appendChild(b);
        });
    }

    const log = msg => ($log.innerHTML += `<div>${msg}</div>`, $log.scrollTo(0,$log.scrollHeight));

    /* ------------------- 6. Attaque du joueur ----------------------------- */
    async function performAttack(skillName) {
        log(`<span style="color:green">${currentPlayer.name}</span> utilise ${skillName}…`);

        /* → Appel backend pour calcul des dégâts */
        const res = await fetch("/PokeRogue/PlayerAttack", {
            method : "POST",
            headers: { "Content-Type":"application/x-www-form-urlencoded" },
            body   : new URLSearchParams({
                attackerName: currentPlayer.name,
                targetName  : currentEnemy.name,
                skillName
            })
        });

        if (!res.ok) {
            return log(`<span style="color:red">Erreur serveur !</span>`);
        }

        const data = await res.json();
        currentEnemy.healthPoint = data.targetRemainingHP;
        log(`💥 ${data.damage} dégâts infligés à ${data.targetName}`);

        /* KO ? */
        if (currentEnemy.healthPoint <= 0) {
            log(`<span style="color:red">${currentEnemy.name} est K.O.</span>`);
            const next = enemyTeam.find(x => x.healthPoint > 0);
            if (next) {
                currentEnemy = next;
                log(`L'ennemi envoie ${next.name} !`);
            } else {
                await victorySequence();
                return;
            }
        }

        
        enemyCounter();
        renderTeams(); 
        saveGame();
    }

    /* ------------------- 7. Contre-attaque ennemie ------------------------ */
    function enemyCounter() {
        const dmg = Math.floor(Math.random()*8)+5;
        currentPlayer.healthPoint = Math.max(0, currentPlayer.healthPoint-dmg);
        log(`<span style="color:red">${currentEnemy.name}</span> inflige ${dmg} dégâts à ${currentPlayer.name}`);

        if (currentPlayer.healthPoint <= 0) {
            log(`<span style="color:red">${currentPlayer.name} est K.O.</span>`);
            const next = playerTeam.find(x => x.healthPoint > 0);
            if (next) {
                currentPlayer = next;
                log(`🟠 Vous envoyez ${next.name}`);
                renderSkills();
            } else {
                log(`<strong style="color:red">Défaite…</strong>`);
                $skillsPanel.innerHTML = "";
            }
        }
    }

    /* ------------------- 8. Victoire -------------------------------------- */
    async function victorySequence() {
        log(`<strong style="color:green">Victoire ! Tous les ennemis K.O.</strong>`);

        /* Récompense */
        const gain = { Pokedollar:20, Experience:10, Game:"pokerogue" };
        try {
            const r = await fetch("/api/player/update", {
                method : "POST",
                headers: { "Content-Type":"application/json" },
                credentials:"include",
                body    : JSON.stringify(gain)
            });
            if (r.ok) {
                const p = await r.json();
                log(`+${gain.Pokedollar}💰  +${gain.Experience} XP  (solde : ${p.pokedollar})`);
            }
        } catch { /* ignore */ }

        /* Soigne les ennemis (backend) */
        await fetch("/PokeRogue/EndMatch", {
            method : "POST",
            headers: { "Content-Type":"application/json" },
            body   : JSON.stringify(enemyTeam.map(e => e.name))
        });

        /* Boutons post-combat */
        $skillsPanel.innerHTML = "";
        $actionPanel.innerHTML = `
            <button id="btnNew"  class="btn btn-success me-2">⚔️ Nouveau combat</button>
            <button id="btnShop" class="btn btn-warning">🛒 Boutique</button>
        `;
        document.getElementById("btnNew").onclick  = () => location.reload();
        document.getElementById("btnShop").onclick = () => location.href="/PokeRogue/Shop";
    }

    /* ------------------- 9. Helpers --------------------------------------- */
    function shuffle(arr){
        for(let i=arr.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [arr[i],arr[j]]=[arr[j],arr[i]];
        }
        return arr;
    }

    async function addSprites(list) {
        await Promise.all(list.map(async p => {
            try {
                const r = await fetch(`${POKE_API}${p.name.toLowerCase()}`);
                if (r.ok) {
                    const data = await r.json();
                    p.sprite = data.sprites.front_default;
                }
            } catch { /* ignore */ }
        }));
    }

    /* ------------------- 10. Lancement initial du rendu ------------------- */
    renderTeams();
    renderSkills();
    saveGame();
});

