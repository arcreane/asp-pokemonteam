window.loadPlayerSummary = async function (game) {          // ← exposé en global
    try {
        const res = await fetch(`/api/player/me?game=${game}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const player = await res.json();

        const box = document.getElementById('player-summary');
        if (!box) return;                                    // rien à faire si pas de conteneur

        box.innerHTML = `
            <div class="player-info-box bg-light p-3 rounded shadow-sm mb-3">
                <h5>🧑 ${player.name}</h5>
                <p>💸 <strong>${player.pokedollar}</strong> pokédollars</p>
                <p>🌟 XP : <strong>${player.experience}</strong></p>
                ${progressBar(player.experience)}
            </div>`;
    } catch (err) {
        console.warn("Résumé joueur indisponible :", err);
    }
};

/* :: barre de progression XP :: */
function progressBar(xp) {
    const step = 100;                       // ex. 100 XP = niveau suivant
    const pct  = Math.min(100, (xp % step));
    return `
        <div class="progress" style="height:6px;">
            <div class="progress-bar bg-success" style="width:${pct}%"></div>
        </div>`;
}