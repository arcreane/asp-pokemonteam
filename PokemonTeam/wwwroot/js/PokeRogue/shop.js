/**************************************************************************
 *  PokéRogue – SHOP                                                     *
 *  -> achat / utilisation d’objets de soin                               *
 *  -> synchronisation avec la sauvegarde locale (pokerogueSave)         *
 **************************************************************************/

/* -------------------------------------------------------------------- */
/* 1.  Constantes                                                       */
/* -------------------------------------------------------------------- */

const HEAL_VALUES = {
    "Potion"       :  20,   // +20 PV
    "Super Potion" :  60,   // +60 PV
    "Hyper Potion" : 120,   // +120 PV
    "Max Potion"   : "max"  // full life
};

const SAVE_KEY = "pokerogueSave";     // clé localStorage

/* -------------------------------------------------------------------- */
/* 2.  Chargement initial après playerReady (voir PlayerProfileHeader)   */
/* -------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    playerReady            // promesse globale définie dans PlayerProfileHeader.js
        .then(() => {
            console.log("✅ Player prêt pour la boutique");

            loadShop();            // liste des objets dispo
            loadPlayer();          // solde pokédollars / xp
            loadInventory();       // inventaire perso
            renderTeamInShop();    // affichage de la team pour info
            loadPlayerSummary(game);
        })
        .catch(err => {
            console.error("Erreur playerReady :", err);
            window.location.href = "/";   // redirige si non connecté
        });
});

/* -------------------------------------------------------------------- */
/* 3.  Affichage de la boutique                                          */
/* -------------------------------------------------------------------- */

async function loadShop() {
    try {
        const res   = await fetch("/api/shop/list");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const items = await res.json();
        const shopDiv = document.getElementById("shop-items");
        shopDiv.innerHTML = "";

        items.forEach(item => {
            const healTxt = HEAL_VALUES[item.name] === "max"
                ? "Soin total"
                : `+${HEAL_VALUES[item.name]} PV`;

            shopDiv.insertAdjacentHTML(
                "beforeend",
                `<div class="shop-entry">
                    <strong>${item.name}</strong> – ${item.price}💰 – ${healTxt}
                    <button class="buy-btn" data-id="${item.id}">Acheter</button>
                 </div>`
            );
        });

        /* ⤷  on attache les handlers APRES avoir injecté le HTML */
        document.querySelectorAll(".buy-btn").forEach(btn => {
            btn.addEventListener("click", () => buyItem(btn.dataset.id));
        });

    } catch (err) {
        console.error("loadShop:", err);
    }
}

/* -------------------------------------------------------------------- */
/* 4.  Achat d’un objet                                                  */
/* -------------------------------------------------------------------- */

async function buyItem(itemId) {
    try {
        const res = await fetch("/api/shop/buy", {
            method : "POST",
            credentials: "include",
            headers : { "Content-Type": "application/json" },
            body    : JSON.stringify({ itemId, game })
        });

        if (!res.ok) {
            alert("❌ Achat impossible");
            return;
        }

        alert("✅ Objet acheté !");
        await loadPlayer();      // MAJ du solde
        await loadInventory();   // MAJ inventaire

    } catch (err) {
        console.error("buyItem:", err);
    }
}

/* -------------------------------------------------------------------- */
/* 5.  Solde & résumé joueur                                             */
/* -------------------------------------------------------------------- */

async function loadPlayer() {
    try {
        const res = await fetch(`/api/player/me?game=${game}`, { credentials:"include" });
        if (!res.ok) throw new Error("Pas de player");

        const player = await res.json();
        document.getElementById("player-balance").textContent = player.pokedollar;

        loadPlayerSummary(game);     // petit bloc « XP / $ » (partial)
    } catch {
        document.getElementById("player-balance").textContent = "0";
    }
}

/* -------------------------------------------------------------------- */
/* 6.  Chargement de l’inventaire                                        */
/* -------------------------------------------------------------------- */

async function loadInventory() {
    try {
        const res = await fetch(`/api/player/my-items?game=${game}`, { credentials:"include" });
        if (!res.ok) throw new Error("no items");

        const items = await res.json();
        const inv   = document.getElementById("player-items");
        inv.innerHTML = "";

        items.forEach(it => {
            const healTxt = HEAL_VALUES[it.name] === "max"
                ? "Soin total"
                : `+${HEAL_VALUES[it.name]} PV`;

            inv.insertAdjacentHTML(
                "beforeend",
                `<div class="inv-entry">
                    ${it.name} – ${healTxt}
                    <button class="use-btn"
                        data-id="${it.id}"
                        data-name="${it.name}"
                        data-heal="${HEAL_VALUES[it.name]}"
                    >Utiliser</button>
                 </div>`
            );
        });

        attachUseHandlers();   // (ré)-attache les clics

    } catch (err) {
        console.warn("loadInventory:", err);
    }
}

/* -------------------------------------------------------------------- */
/* 7.  Utilisation d’un objet : POP-UP de sélection + maj save + API      */
/* -------------------------------------------------------------------- */

function attachUseHandlers() {
    document.querySelectorAll(".use-btn").forEach(btn => {
        btn.onclick = () => openHealPopup({
            itemId : btn.dataset.id,
            itemName: btn.dataset.name,
            heal    : btn.dataset.heal   // "max" ou valeur numérique
        });
    });
}

/* ---------- pop-up joli pour choisir le Pokémon à soigner ----------- */

function openHealPopup({ itemId, itemName, heal }) {
    /* récup de la team depuis la sauvegarde */
    const rawSave = localStorage.getItem(SAVE_KEY);
    if (!rawSave) { alert("Aucune sauvegarde."); return; }

    const save = JSON.parse(rawSave);
    const team = Array.isArray(save) ? save : save.team;   // compat’ anciennes saves
    if (!Array.isArray(team)) { alert("Sauvegarde corrompue."); return; }

    /* overlay + boîte */
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    const box = document.createElement("div");
    box.className = "popup-box";
    box.innerHTML = `<h3>Soigner avec ${itemName}</h3>
                     <p>Choisis le Pokémon :</p>`;

    /* un bouton par pokémon */
    team.forEach(p => {
        const b = document.createElement("button");
        b.className = "pk-choice-btn";
        b.textContent = `${p.name} (${p.healthPoint}/${p.maxHealthPoint})`;
        b.onclick = () => applyHeal(itemId, itemName, heal, p, team, overlay);
        box.appendChild(b);
    });

    /* bouton annuler */
    const cancel = document.createElement("button");
    cancel.textContent = "Annuler";
    cancel.className   = "cancel-btn";
    cancel.onclick     = () => overlay.remove();
    box.appendChild(cancel);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

/* ---------- applique le soin & synchronise backend + save ----------- */

async function applyHeal(itemId, itemName, heal, target, team, overlay) {
    try {
        /* 1/ Appel backend - supprime l’objet de l’inventaire */
        const res = await fetch("/api/player/use-item", {
            method : "POST",
            credentials:"include",
            headers : { "Content-Type":"application/json" },
            body    : JSON.stringify({ itemId, game })
        });
        if (!res.ok) throw new Error("API KO");

        /* 2/ Applique le soin localement */
        const amount = heal === "max" ? target.maxHealthPoint : parseInt(heal,10);
        target.healthPoint = Math.min(target.maxHealthPoint,
            heal === "max" ? target.maxHealthPoint : target.healthPoint + amount);

        /* 3/ Re-sauvegarde */
        localStorage.setItem(SAVE_KEY, JSON.stringify({ team }));

        alert(`${target.name} a été soigné !`);
        overlay.remove();
        loadInventory();    // rafraîchit la liste (l’objet a disparu)
        renderTeamInShop(); // met à jour l’affichage des PV

    } catch (err) {
        console.error("applyHeal:", err);
        alert("Erreur lors de l’utilisation de l’objet.");
    }
}

/* -------------------------------------------------------------------- */
/* 8.  Mini-affichage de la team dans la page Boutique                   */
/* -------------------------------------------------------------------- */

function renderTeamInShop() {
    const container = document.getElementById("player-team");
    if (!container) return;

    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { container.innerHTML = "<em>Aucune équipe enregistrée.</em>"; return; }

    const save = JSON.parse(raw);
    const team = Array.isArray(save) ? save : save.team;
    if (!Array.isArray(team)) { container.innerHTML = "<em>Sauvegarde invalide.</em>"; return; }

    container.innerHTML = "<h4>🎮 Votre équipe</h4>";
    team.forEach(p => {
        container.insertAdjacentHTML(
            "beforeend",
            `<div class="pokemon-entry">
                ${p.name} – ${p.healthPoint}/${p.maxHealthPoint} PV
             </div>`
        );
    });
}

