async function loadShop() {
const res = await fetch('/api/shop/list');
const items = await res.json();

const shopDiv = document.getElementById('shop-items');
shopDiv.innerHTML = '';
items.forEach(item => {
shopDiv.innerHTML += `
            <div>
                <strong>${item.name}</strong> - ${item.price} Pokédollars
                <button onclick="buyItem(${item.id})">Acheter</button>
            </div>
        `;
});
}

async function buyItem(itemId) {
const res = await fetch('/api/shop/buy', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ itemId: itemId, game: game })
});

if (res.ok) {
alert('Achat réussi !');
loadPlayer();
loadInventory();
} else {
const msg = await res.text();
alert('Erreur : ' + msg);
}
}

async function loadPlayer() {
const res = await fetch(`/api/player/me?game=${game}`);
const player = await res.json();
document.getElementById('player-balance').innerText = player.pokedollar;
}

async function loadInventory() {
const res = await fetch(`/api/player/my-items?game=${game}`);
const items = await res.json();

const invDiv = document.getElementById('player-items');
invDiv.innerHTML = '';
items.forEach(item => {
invDiv.innerHTML += `
        <div>
            ${item.name}
            <button onclick="useItem(${item.id})">Utiliser</button>
        </div>
    `;
});
}


async function useItem(itemId) {
const res = await fetch('/api/player/use-item', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ itemId: itemId, game: game })
});

if (res.ok) {
alert('Objet utilisé !');
loadInventory();
} else {
const msg = await res.text();
alert('Erreur : ' + msg);
}
}

// Initialisation
loadShop();
loadPlayer();
loadInventory();
