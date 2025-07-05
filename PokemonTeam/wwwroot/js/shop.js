console.log("shop.js chargé ✔️");


async function loadShop() {
    try {
        const res = await fetch('/api/shop/list');
        const items = await res.json();

        const shopDiv = document.getElementById('shop-items');
        shopDiv.innerHTML = '';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <strong>${item.name}</strong> - ${item.price} Pokédollars
                <button class="buy-btn">Acheter</button>
            `;

            itemDiv.querySelector('.buy-btn').addEventListener('click', () => buyItem(item.id));
            shopDiv.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Erreur loadShop:", error);
    }
}

async function buyItem(itemId) {
    try {
        const res = await fetch('/api/shop/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemId, game: game })
        });

        if (res.ok) {
            alert('✅ Achat réussi !');
            await loadPlayer();
            await loadInventory();
        } else {
            const msg = await res.text();
            alert('❌ Erreur : ' + msg);
        }
    } catch (error) {
        console.error("Erreur buyItem:", error);
    }
}

async function loadPlayer() {
    try {
        const res = await fetch(`/api/player/me?game=${game}`);
        const player = await res.json();
        document.getElementById('player-balance').innerText = player.pokedollar;
    } catch (error) {
        console.error("Erreur loadPlayer:", error);
    }
}

async function loadInventory() {
    try {
        const res = await fetch(`/api/player/my-items?game=${game}`);
        const items = await res.json();

        const invDiv = document.getElementById('player-items');
        invDiv.innerHTML = '';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                ${item.name}
                <button class="use-btn">Utiliser</button>
            `;

            itemDiv.querySelector('.use-btn').addEventListener('click', () => useItem(item.id));
            invDiv.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Erreur loadInventory:", error);
    }
}

async function useItem(itemId) {
    try {
        const res = await fetch('/api/player/use-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemId, game: game })
        });

        if (res.ok) {
            const boost = getPotionBoostByItemId(itemId);
            window.activeBoost = boost;

            alert(`✅ Potion utilisée ! Boost de vitesse : +${boost}`);

            await loadInventory();
        } else {
            const msg = await res.text();
            alert('❌ Erreur : ' + msg);
        }

    } catch (error) {
        console.error("Erreur useItem:", error);
    }
}

function getPotionBoostByItemId(itemId) {
    // Exemple ➜ adapte ça à tes ID réels !
    switch (itemId) {
        case 1: return 2;   // Potion
        case 2: return 4;   // Super potion
        case 3: return 6;   // Hyper potion
        case 4: return 8;   // Max potion
        default: return 0;
    }
}

// Initialisation
loadShop();
loadPlayer();
loadInventory();
