/** Nom de la clé localStorage utilisée */
const SAVE_KEY = "pokerogueSave";

/* Au chargement de la page */
window.addEventListener("DOMContentLoaded", () => {

    playerReady.then(() => {
        loadPlayerSummary(game)
    }).catch(err => {
        console.error("Erreur lors du chargement du joueur:", err);
        window.location.href = "/AuthPage";

    });
    
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
        console.log("Aucune sauvegarde trouvée");
        return; // rien à faire : le bouton « Nouvelle aventure » reste visible
    }

    let save;
    try {
        save = JSON.parse(raw);
    } catch (e) {
        console.warn("Sauvegarde corrompue :", e);
        return;
    }

    /* On s’attend à avoir save.team = tableau */
    if (!Array.isArray(save.team) || save.team.length === 0) {
        console.warn("Sauvegarde sans équipe !");
        return;
    }

    // Masque le bouton « Nouvelle aventure » et affiche le panneau sauvegarde
    document.getElementById("new-game-btn").style.display = "none";
    const panel = document.getElementById("save-panel");
    panel.style.display = "block";

    // --- Aperçu des Pokémon ---
    const preview = document.getElementById("team-preview");
    preview.innerHTML = "";

    save.team.forEach(p => {
        const card = document.createElement("div");
        card.className = "border rounded p-2 text-center";
        card.style.minWidth = "130px";

        card.innerHTML = `
            <strong>${p.name}</strong><br>
            PV&nbsp;: ${p.healthPoint}/${p.maxHealthPoint}
        `;
        preview.appendChild(card);
    });

    // --- Boutons ---
    document.getElementById("load-btn").addEventListener("click", () => {
        // Redirige vers le combat ou un écran intermédiaire de reprise
        window.location.href = "/PokeRogue/Combat";
    });

    document.getElementById("reset-btn").addEventListener("click", key => {
        if (confirm("Supprimer définitivement cette sauvegarde ?")) {
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem("playerTeam");
            
            // Recharge la page pour revenir à l’état « aucune sauvegarde »
            window.location.reload();
        }
    });
});
