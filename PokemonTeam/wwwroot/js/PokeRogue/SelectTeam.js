window.addEventListener("DOMContentLoaded", function() {
    const listDiv = document.getElementById("pokemonList");
        const form = document.getElementById("teamForm");

        if (!form || !listDiv) {
        console.error("teamForm ou pokemonList introuvable !");
        return;
    }

        async function loadPokemons() {
        try {
        const res = await fetch("/Pokemon/getAllPokemon"); // appelle ton controller PokemonController
        const pokemons = await res.json();
        console.log(pokemons);

        for (const [index, p] of pokemons.entries()) {
        let imgUrl = "";
        try {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
        const data = await pokeRes.json();
        imgUrl = data.sprites.front_default;
    } catch (err) {
        console.error(`Image non trouvée pour ${p.name}`, err);
        imgUrl = "https://via.placeholder.com/96x96?text=No+Img";
    }

        const card = document.createElement("div");
        card.className = "pokemon-card";
        card.innerHTML = `
                    <input type="checkbox" id="poke${index}" name="pokemonSelect" value="${p.name}">
                    <label for="poke${index}">
                    <strong>${p.name}</strong> (${p.types.join("/")})<br>
                        <img src="${imgUrl}" alt="${p.name}"><br>
                        PV: ${p.healthPoint}<br>
                        Attaque: ${p.strength}<br>
                        Défense: ${p.defense}
                    </label>
                `;
        listDiv.appendChild(card);
    }
    } catch (error) {
        console.error("Erreur API Pokemon", error);
        listDiv.innerHTML = `<div class="alert alert-danger">Impossible de charger les Pokémon.</div>`;
    }
    }

        loadPokemons();

        form.addEventListener("submit", function(e) {
        e.preventDefault();
        const selected = document.querySelectorAll('input[name="pokemonSelect"]:checked');
        if (selected.length !== 3) {
        alert("Vous devez choisir exactement 3 Pokémon !");
        return false;
    }
        const team = Array.from(selected).map(el => el.value);
        localStorage.setItem("playerTeam", JSON.stringify(team));
        alert("Équipe validée !");
        window.location.href = "/PokeRogue/Combat";
    });
        });

