const runnersContainer = document.getElementById("runnersSelection");
const selectedRunners = [];

pokemons.forEach(async pokeName => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
    const data = await res.json();
    const frontSprite = data.sprites.front_default;

    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.innerHTML = `
        <img src="${frontSprite}" alt="${pokeName}" />
        <p>${pokeName}</p>
    `;

    card.addEventListener('click', () => {
        if (card.classList.contains('selected')) {
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
    });

    runnersContainer.appendChild(card);
});

document.getElementById('startRace').addEventListener('click', () => {
    if (selectedRunners.length !== 4) {
        alert("Sélectionne d'abord 4 Pokémon coureurs !");
        return;
    }

    const betContainer = document.getElementById("betSelection");
    betContainer.innerHTML = ""; // reset

    selectedRunners.forEach(pokeName => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `<p>${pokeName}</p>`;

        card.addEventListener('click', () => {
            document.querySelectorAll('#betSelection .pokemon-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('selectedPokemon').value = pokeName;
        });

        betContainer.appendChild(card);
    });
});

pokemons = [...selectedRunners];
