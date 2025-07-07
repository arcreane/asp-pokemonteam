window.addEventListener("DOMContentLoaded", async function() {
    // Récupération de l'équipe joueur
    const teamNames = JSON.parse(localStorage.getItem("playerTeam"));
    if (!teamNames) {
        alert("Aucune équipe choisie !");
        window.location.href = "/PokeRogue/SelectTeam";
        return;
    }

    // Charger les Pokémon depuis l'API
    const res = await fetch("Pokemon/getAllPokemon");
    const pokemons = await res.json();

    // Charger les détails des Pokémon sélectionnés
    const playerTeam = pokemons.filter(p => teamNames.includes(p.name));

    // Génération d'une équipe ennemie aléatoire
    const shuffled = pokemons.sort(() => 0.5 - Math.random());
    const enemyTeam = shuffled.slice(0, 3);

    // État du combat
    let currentPlayerPokemon = {...playerTeam[0]};
    let currentEnemyPokemon = {...enemyTeam[0]};

    const playerDiv = document.getElementById("playerTeam");
    const enemyDiv = document.getElementById("enemyTeam");
    const logDiv = document.getElementById("battleLog");
    const actionPanel = document.getElementById("actionPanel");

    function renderTeams() {
        playerDiv.innerHTML = "";
        enemyDiv.innerHTML = "";

        playerTeam.forEach(p => {
            playerDiv.innerHTML += `
                <div class="pokemon-card ${p.name === currentPlayerPokemon.name ? 'active' : ''}">
                    <strong>${p.name}</strong> (${p.types.join("/")})<br>
                    PV: ${p.healthPoint}/${p.maxHealthPoint}
                </div>
            `;
        });

        enemyTeam.forEach(p => {
            enemyDiv.innerHTML += `
                <div class="pokemon-card ${p.name === currentEnemyPokemon.name ? 'active' : ''}">
                    <strong>${p.name}</strong> (${p.types.join("/")})<br>
                    PV: ${p.healthPoint}/${p.maxHealthPoint}
                </div>
            `;
        });
    }

    renderTeams();

    actionPanel.innerHTML = `
        <button class="btn btn-primary" id="attackBtn">Attaquer</button>
        <button class="btn btn-secondary" id="changeBtn">Changer Pokémon</button>
    `;

    document.getElementById("attackBtn").addEventListener("click", function() {
        const damage = Math.floor(Math.random() * 10) + 5;
        currentEnemyPokemon.healthPoint -= damage;
        currentEnemyPokemon.healthPoint = Math.max(0, currentEnemyPokemon.healthPoint);

        logDiv.innerHTML += `<div>${currentPlayerPokemon.name} attaque ${currentEnemyPokemon.name} et inflige ${damage} dégâts !</div>`;

        // Vérifie si l'ennemi est K.O
        if (currentEnemyPokemon.healthPoint <= 0) {
            logDiv.innerHTML += `<div>${currentEnemyPokemon.name} est K.O !</div>`;
            const next = enemyTeam.find(p => p.healthPoint > 0);
            if (next) {
                currentEnemyPokemon = next;
                logDiv.innerHTML += `<div>L'adversaire envoie ${next.name} !</div>`;
            } else {
                logDiv.innerHTML += `<div>Vous avez gagné le combat !</div>`;
                actionPanel.innerHTML = "";
                return;
            }
        }

        // riposte ennemie
        const enemyDamage = Math.floor(Math.random() * 8) + 5;
        currentPlayerPokemon.healthPoint -= enemyDamage;
        currentPlayerPokemon.healthPoint = Math.max(0, currentPlayerPokemon.healthPoint);

        logDiv.innerHTML += `<div>${currentEnemyPokemon.name} contre-attaque ${currentPlayerPokemon.name} et inflige ${enemyDamage} dégâts !</div>`;

        // Vérifie si le joueur est K.O
        if (currentPlayerPokemon.healthPoint <= 0) {
            logDiv.innerHTML += `<div>${currentPlayerPokemon.name} est K.O !</div>`;
            const next = playerTeam.find(p => p.healthPoint > 0);
            if (next) {
                currentPlayerPokemon = next;
                logDiv.innerHTML += `<div>Vous envoyez ${next.name} !</div>`;
            } else {
                logDiv.innerHTML += `<div>Vous avez perdu le combat !</div>`;
                actionPanel.innerHTML = "";
                return;
            }
        }

        renderTeams();
        logDiv.scrollTop = logDiv.scrollHeight;
    });

    document.getElementById("changeBtn").addEventListener("click", function() {
        const next = playerTeam.find(p => p.healthPoint > 0 && p.name !== currentPlayerPokemon.name);
        if (next) {
            currentPlayerPokemon = next;
            logDiv.innerHTML += `<div>Vous changez de Pokémon pour ${next.name} !</div>`;
            renderTeams();
        } else {
            logDiv.innerHTML += `<div>Pas d'autres Pokémon vivants à changer.</div>`;
        }
        logDiv.scrollTop = logDiv.scrollHeight;
    });
});