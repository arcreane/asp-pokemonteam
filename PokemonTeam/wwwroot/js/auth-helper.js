// === AUTH HELPER - Fichier séparé pour éviter les problèmes Razor ===

document.addEventListener('DOMContentLoaded', function() {
    checkAuthenticationStatus();
});

// Vérifier le statut d'authentification
async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/auth/check', { credentials: 'include' });
        
        if (response.ok) {
            const userData = await response.json();
            showAuthenticatedUser(userData);
            await loadUserGameData();
        } else {
            showUnauthenticatedState();
        }
    } catch (error) {
        console.log('Utilisateur non connecté');
        showUnauthenticatedState();
    }
}

// Afficher l'état utilisateur connecté
function showAuthenticatedUser(userData) {
    const authButtons = document.getElementById('auth-buttons');
    const playerSection = document.getElementById('player-section');
    const playerName = document.getElementById('player-name');
    
    if (authButtons) authButtons.style.display = 'none';
    if (playerSection) playerSection.style.display = 'flex';
    
    // Extraction de l'email sans problème Razor
    const emailPart = userData.email.split('@')[0];
    if (playerName) playerName.textContent = emailPart || 'Joueur';
}

// Afficher l'état utilisateur non connecté
function showUnauthenticatedState() {
    const authButtons = document.getElementById('auth-buttons');
    const playerSection = document.getElementById('player-section');
    
    if (authButtons) authButtons.style.display = 'block';
    if (playerSection) playerSection.style.display = 'none';
}

// Charger les données de jeu de l'utilisateur
async function loadUserGameData() {
    try {
        const playerResponse = await fetch('/api/player/me?game=Arena', { credentials: 'include' });
        
        if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            updateNavbarStats(playerData);
        } else {
            await createPlayerIfNeeded();
        }
    } catch (error) {
        console.log('Erreur chargement données joueur:', error);
        updateNavbarStats({ pokedollar: 0, experience: 0 });
    }
}

// Créer un joueur si nécessaire
async function createPlayerIfNeeded() {
    try {
        const userInfo = await fetch('/auth/check', { credentials: 'include' }).then(r => r.json());
        const emailPart = userInfo.email.split('@')[0];
        const playerName = emailPart + '-Arena';
        
        const createResponse = await fetch('/api/player/create', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, game: 'Arena' })
        });
        
        if (createResponse.ok) {
            const newPlayer = await createResponse.json();
            updateNavbarStats(newPlayer);
        }
    } catch (error) {
        console.error('Erreur création joueur:', error);
        updateNavbarStats({ pokedollar: 0, experience: 0 });
    }
}

// Mettre à jour les stats dans la navbar
function updateNavbarStats(playerData) {
    const money = playerData.pokedollar || 0;
    const xp = playerData.experience || 0;
    const level = Math.floor(xp / 100) + 1;
    
    const moneyElement = document.getElementById('navbar-money');
    const xpElement = document.getElementById('navbar-xp');
    const levelElement = document.getElementById('navbar-level');
    
    if (moneyElement) moneyElement.textContent = formatNumber(money);
    if (xpElement) xpElement.textContent = formatNumber(xp);
    if (levelElement) levelElement.textContent = level;
    
    localStorage.setItem('playerStats', JSON.stringify({ money: money, xp: xp, level: level }));
}

// Formater les nombres
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Gérer la déconnexion
document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'logout-btn' || e.target.closest('#logout-btn'))) {
        handleLogout();
    }
});

async function handleLogout() {
    try {
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.clear();
        showGlobalNotification('Déconnexion réussie !', 'success');
        
        setTimeout(function() {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        showGlobalNotification('Erreur lors de la déconnexion', 'error');
    }
}

// Fonction globale pour les notifications
function showGlobalNotification(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    const notification = document.createElement('div');
    let alertClass = 'alert-info';
    let iconClass = 'fa-info-circle';
    
    if (type === 'success') {
        alertClass = 'alert-success';
        iconClass = 'fa-check-circle';
    } else if (type === 'error') {
        alertClass = 'alert-danger';
        iconClass = 'fa-exclamation-triangle';
    } else if (type === 'warning') {
        alertClass = 'alert-warning';
        iconClass = 'fa-exclamation-circle';
    }
    
    notification.className = 'alert ' + alertClass + ' alert-dismissible fade show';
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: none; border-radius: 10px;';
    notification.innerHTML = '<div class="d-flex align-items-center"><i class="fas ' + iconClass + ' me-2"></i><span>' + message + '</span><button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button></div>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(function() {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 150);
        }
    }, duration);
}

// Rendre les fonctions disponibles globalement
window.updateNavbarStats = updateNavbarStats;
window.showGlobalNotification = showGlobalNotification;