// === SCRIPT DE DÉBOGAGE TOKEN ===
// Ajouter temporairement dans _Layout.cshtml pour diagnostiquer

console.log('=== DÉBOGAGE TOKEN ===');

// Vérifier tous les cookies
console.log('Tous les cookies:', document.cookie);

// Vérifier le cookie access_token spécifiquement
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const token = getCookie('access_token');
console.log('Token access_token:', token);

// Test d'appel API avec logging détaillé
async function testAuth() {
    console.log('=== TEST AUTHENTIFICATION ===');
    
    try {
        console.log('1. Test /auth/check...');
        const response = await fetch('/auth/check', { 
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('2. Status de la réponse:', response.status);
        console.log('3. Headers de la réponse:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('4. Données utilisateur:', data);
        } else {
            const errorText = await response.text();
            console.log('4. Erreur:', errorText);
        }
        
    } catch (error) {
        console.error('5. Erreur fetch:', error);
    }
}

// Test après 2 secondes pour laisser le temps à la page de se charger
setTimeout(testAuth, 2000);

// Fonction utilitaire pour tester manuellement
window.debugAuth = testAuth;