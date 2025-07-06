// ✅ Vérifie et affiche l'état auth général
fetch('/auth/check', { credentials: 'include' })
    .then(res => res.ok ? res.json() : Promise.reject('Not logged in'))
    .then(data => {
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('logout-section').style.display = 'block';
        // Affiche email par défaut, sera remplacé par le nom du Player si dispo
        document.getElementById('player-info').innerText = `👋 ${data.email}`;
    })
    .catch(() => {
        console.log('Pas connecté');
    });

// ✅ Bouton logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = '/';
});

// ✅ Promesse globale pour garantir que le Player existe AVANT le reste
var playerReady = new Promise((resolve, reject) => {

    if (typeof game !== 'undefined' && game) {

        fetch('/auth/check', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Not logged'))
            .then(async data => {
                const email = data.email;

                // Vérifie si Player existe
                const resPlayer = await fetch(`/api/player/me?game=${game}`, { credentials: 'include' });

                if (resPlayer.ok) {
                    const player = await resPlayer.json();
                    document.getElementById('player-info').innerText = `👋 ${player.name}`;
                    resolve(); // ✅ Player existant prêt
                } else {
                    // Crée le Player automatiquement
                    const prefix = email.split('@')[0];
                    const playerName = `${prefix}-${game}`;
                    console.log("Création du joueur:", playerName);

                    const createRes = await fetch('/api/player/create', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: playerName, game: game })
                    });

                    if (createRes.ok) {
                        const newPlayer = await createRes.json();
                        document.getElementById('player-info').innerText = `👋 ${newPlayer.name}`;
                        resolve(); // ✅ Player créé et prêt
                    } else {
                        console.error("Erreur création profil joueur");
                        reject("Erreur création profil joueur");
                    }
                }
            })
            .catch(err => {
                console.log('Utilisateur non connecté');
                reject(err);
            });

    } else {
        resolve(); // pas de jeu actif
    }

});
