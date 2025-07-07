window.addEventListener("DOMContentLoaded", function() {
    // Récupération de l'équipe joueur
    const teamNames = JSON.parse(localStorage.getItem("playerTeam"));
    if (!teamNames) {
        alert("Aucune équipe choisie !");
        window.location.href = "/PokeRogue/SelectTeam";
        return;
    }

    // On va utiliser les mêmes stats mockées qu'avant
    const pokemons = [ /* copie de ton JSON de pokémons ici */ ];

    // Charger les détails des Pokémon sélectionnés
    const playerTeam = pokemons.filter(p => teamNames.includes(p.name));

    // Génération d'une équipe ennemie aléatoire
    const shuffled = pokemons.sort(() => 0.5 - Math.random());
    const enemyTeam = shuffled.slice(0, 3);

    // Rendu
    const playerDiv = document.getElementById("playerTeam");
    const enemyDiv = document.getElementById("enemyTeam");
    const logDiv = document.getElementById("battleLog");
    const actionPanel = document.getElementById("actionPanel");

    playerTeam.forEach(p => {
        playerDiv.innerHTML += `
            <div class="pokemon-card">
                <strong>${p.name}</strong> (${p.types.join("/")})<br>
                PV: ${p.healthPoint}/${p.maxHealthPoint}
            </div>
        `;
    });

    enemyTeam.forEach(p => {
        enemyDiv.innerHTML += `
            <div class="pokemon-card">
                <strong>${p.name}</strong> (${p.types.join("/")})<br>
                PV: ${p.healthPoint}/${p.maxHealthPoint}
            </div>
        `;
    });

    // Exemple actions
    actionPanel.innerHTML = `
        <button class="btn btn-primary" id="attackBtn">Attaquer</button>
        <button class="btn btn-secondary" id="changeBtn">Changer Pokémon</button>
    `;

    document.getElementById("attackBtn").addEventListener("click", function() {
        logDiv.innerHTML += `<div>Vous attaquez ! (logique à coder)</div>`;
    });

    document.getElementById("changeBtn").addEventListener("click", function() {
        logDiv.innerHTML += `<div>Vous changez de Pokémon ! (logique à coder)</div>`;
    });

});