// === COMBAT SYSTEM COMPLET CORRIGÉ ===

let currentBattle = {
    player: null,
    enemy: null,
    isPlayerTurn: true,
    battleActive: false
};

// Initialize combat system - VERSION CORRIGÉE
async function initializeCombat() {
    console.log('=== INITIALISATION COMBAT ===');
    
    try {
        // 1. Charger le Pokémon du joueur
        await setupPlayerPokemon();
        
        // 2. Configurer les event listeners
        setupEventListeners();
        
        // 3. Démarrer le premier combat
        await startNewBattle();
        
        console.log('Combat initialisé avec succès');
    } catch (error) {
        console.error('Erreur initialisation combat:', error);
        
        // Affichage d'erreur à l'utilisateur
        const skillButtonsContainer = document.getElementById('skill-buttons');
        if (skillButtonsContainer) {
            skillButtonsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erreur de chargement du combat. 
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.location.reload()">
                        Recharger
                    </button>
                </div>
            `;
        }
    }
}

// Setup player's Pokémon depuis l'API - VERSION CORRIGÉE
async function setupPlayerPokemon() {
    try {
        // Essayer de récupérer le Pokémon du joueur
        const response = await fetch('/api/player/my-pokemon?game=Arena', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const pokemonData = await response.json();
            
            currentBattle.player = {
                id: pokemonData.id,
                name: pokemonData.name,
                types: pokemonData.types || ['electric'],
                healthPoint: pokemonData.healthPoint,
                maxHealthPoint: pokemonData.maxHealthPoint,
                strength: pokemonData.strength,
                defense: pokemonData.defense,
                speed: pokemonData.speed,
                skills: pokemonData.skills || []
            };
            
            // Si pas de skills, ajouter des skills par défaut
            if (currentBattle.player.skills.length === 0) {
                currentBattle.player.skills = [
                    { id: 1, name: 'Tackle', damage: 40, type: 'normal', powerPoints: 35 },
                    { id: 5, name: 'Thunder Shock', damage: 40, type: 'electric', powerPoints: 30 }
                ];
            }
            
            console.log('Pokémon joueur chargé depuis l\'API:', currentBattle.player);
        } else {
            throw new Error('Impossible de charger le Pokémon du joueur');
        }
    } catch (error) {
        console.error('Erreur chargement Pokémon joueur:', error);
        
        // Fallback: récupérer Pikachu depuis l'API générique
        try {
            const response = await fetch('/Pokemon/getPokemonById/25', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const pokemonData = await response.json();
                
                currentBattle.player = {
                    id: pokemonData.id,
                    name: pokemonData.name,
                    types: pokemonData.types || ['electric'],
                    healthPoint: pokemonData.healthPoint,
                    maxHealthPoint: pokemonData.maxHealthPoint,
                    strength: pokemonData.strength,
                    defense: pokemonData.defense,
                    speed: pokemonData.speed,
                    skills: pokemonData.skills || [
                        { id: 1, name: 'Tackle', damage: 40, type: 'normal', powerPoints: 35 },
                        { id: 5, name: 'Thunder Shock', damage: 40, type: 'electric', powerPoints: 30 }
                    ]
                };
                
                console.log('Pokémon joueur chargé en fallback:', currentBattle.player);
            } else {
                throw new Error('Fallback échoué');
            }
        } catch (fallbackError) {
            console.error('Erreur fallback:', fallbackError);
            
            // Dernier recours: données hardcodées
            currentBattle.player = {
                id: 25,
                name: 'Pikachu',
                types: ['electric'],
                healthPoint: 100,
                maxHealthPoint: 100,
                strength: 55,
                defense: 40,
                speed: 90,
                skills: [
                    { id: 1, name: 'Tackle', damage: 40, type: 'normal', powerPoints: 35 },
                    { id: 5, name: 'Thunder Shock', damage: 40, type: 'electric', powerPoints: 30 }
                ]
            };
            
            console.log('Pokémon joueur chargé en hardcodé:', currentBattle.player);
        }
    }
    
    updatePlayerDisplay();
}

// Setup event listeners - VERSION SIMPLIFIÉE
function setupEventListeners() {
    console.log('=== SETUP EVENT LISTENERS ===');
    
    // New battle button
    const newBattleBtn = document.getElementById('new-battle-btn');
    if (newBattleBtn) {
        newBattleBtn.onclick = async function() {
            console.log('Nouveau combat demandé');
            await startNewBattle();
        };
    }
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.onclick = async function() {
            console.log('Continuer demandé');
            await startNewBattle();
        };
    }
    
    // Run button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.onclick = function() {
            runFromBattle();
        };
    }
    
    console.log('Event listeners configurés');
}

// Start a new battle - VERSION CORRIGÉE
async function startNewBattle() {
    console.log('=== DÉMARRAGE NOUVEAU COMBAT ===');
    
    try {
        // FORCER la génération d'un nouvel ennemi
        currentBattle.enemy = null; // Reset explicite
        currentBattle.enemy = await generateRandomEnemy();
        
        if (!currentBattle.enemy) {
            throw new Error('Impossible de générer un ennemi');
        }
        
        currentBattle.isPlayerTurn = true;
        currentBattle.battleActive = true;
        
        // Reset player health
        if (currentBattle.player) {
            currentBattle.player.healthPoint = currentBattle.player.maxHealthPoint;
            
            // CORRECTION: Reset des PP des attaques du joueur
            currentBattle.player.skills.forEach(skill => {
                if (skill.id === 1) skill.powerPoints = 35; // Tackle
                if (skill.id === 5) skill.powerPoints = 30; // Thunder Shock
                if (skill.powerPoints <= 0) skill.powerPoints = 20; // Reset général
            });
        }
        
        updateDisplays();
        hideResultScreen();
        await updateSkillButtons(); // CORRECTION: await pour s'assurer que les boutons se chargent
        
        logMessage(`Un ${currentBattle.enemy.name} sauvage apparaît !`);
        logMessage('À vous de jouer !');
        
        console.log('Combat démarré avec:', {
            player: currentBattle.player?.name,
            enemy: currentBattle.enemy?.name,
            enemyHP: currentBattle.enemy?.healthPoint
        });
        
    } catch (error) {
        console.error('Erreur démarrage combat:', error);
        showNotification('Erreur lors du démarrage du combat', 'error');
        
        // Fallback d'urgence
        logMessage('Erreur lors du démarrage du combat. Rechargez la page.');
    }
}

// Generate random enemy Pokémon depuis l'API - VERSION CORRIGÉE
async function generateRandomEnemy() {
    console.log('=== GÉNÉRATION NOUVEL ENNEMI ===');
    
    try {
        // Générer un ID aléatoire directement (plus fiable)
        const randomId = Math.floor(Math.random() * 151) + 1;
        console.log(`Tentative de récupération du Pokémon ID: ${randomId}`);
        
        const response = await fetch(`/Pokemon/getPokemonById/${randomId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const pokemonData = await response.json();
            console.log('Données Pokémon reçues:', pokemonData);
            
            // CORRECTION: Assurer que les stats sont dans une plage raisonnable pour un ennemi
            const enemyStats = {
                id: pokemonData.id,
                name: pokemonData.name,
                types: pokemonData.types || ['normal'],
                healthPoint: Math.min(pokemonData.healthPoint * 0.8, 80), // Réduire la vie pour équilibrer
                maxHealthPoint: Math.min(pokemonData.maxHealthPoint * 0.8, 80),
                strength: Math.min(pokemonData.strength * 0.9, 60),
                defense: Math.min(pokemonData.defense * 0.9, 50),
                speed: pokemonData.speed,
                sprite: pokemonData.id.toString(),
                skills: []
            };
            
            // CORRECTION: S'assurer qu'il y a au moins une attaque
            if (pokemonData.skills && pokemonData.skills.length > 0) {
                // Prendre max 2 attaques pour l'ennemi
                enemyStats.skills = pokemonData.skills.slice(0, 2).map(skill => ({
                    id: skill.id,
                    name: skill.name,
                    damage: Math.min(skill.damage, 50), // Limiter les dégâts
                    type: skill.type,
                    powerPoints: skill.powerPoints
                }));
            } else {
                // Attaque par défaut si pas de skills
                enemyStats.skills = [{
                    id: 1,
                    name: 'Tackle',
                    damage: randomInt(25, 40),
                    type: 'normal',
                    powerPoints: 20
                }];
            }
            
            console.log('Ennemi généré:', enemyStats);
            return enemyStats;
        } else {
            console.error('Erreur response API:', response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur génération ennemi depuis API:', error);
    }
    
    // CORRECTION: Fallback plus robuste avec vraie randomisation
    console.log('Utilisation du fallback pour générer l\'ennemi');
    const enemies = [
        { id: 19, name: 'Rattata', sprite: '19', hp: 50, str: 35, def: 25, type: 'normal' },
        { id: 16, name: 'Pidgey', sprite: '16', hp: 45, str: 30, def: 20, type: 'normal' },
        { id: 13, name: 'Weedle', sprite: '13', hp: 40, str: 25, def: 20, type: 'bug' },
        { id: 10, name: 'Caterpie', sprite: '10', hp: 45, str: 20, def: 15, type: 'bug' },
        { id: 21, name: 'Spearow', sprite: '21', hp: 40, str: 35, def: 20, type: 'flying' },
        { id: 23, name: 'Ekans', sprite: '23', hp: 35, str: 40, def: 25, type: 'poison' }
    ];
    
    // VRAIE randomisation à chaque appel
    const randomIndex = Math.floor(Math.random() * enemies.length);
    const template = enemies[randomIndex];
    
    const fallbackEnemy = {
        id: template.id,
        name: template.name,
        types: [template.type],
        healthPoint: template.hp + randomInt(-5, 5), // Petite variation
        maxHealthPoint: template.hp + randomInt(-5, 5),
        strength: template.str + randomInt(-3, 3),
        defense: template.def + randomInt(-3, 3),
        speed: randomInt(25, 45),
        sprite: template.sprite,
        skills: [
            {
                id: 1,
                name: 'Tackle',
                damage: randomInt(25, 40),
                type: 'normal',
                powerPoints: 20
            }
        ]
    };
    
    console.log('Ennemi fallback généré:', fallbackEnemy);
    return fallbackEnemy;
}

// Player attacks - VERSION SIMPLIFIÉE
async function playerAttack(skill) {
    if (!currentBattle.battleActive || !currentBattle.isPlayerTurn) {
        console.log('Attaque ignorée: combat inactif ou pas le tour du joueur');
        return;
    }
    
    console.log(`=== ATTAQUE JOUEUR: ${skill.name} ===`);
    
    currentBattle.isPlayerTurn = false;
    disableActions();
    
    try {
        // Réduire les PP localement
        skill.powerPoints = Math.max(0, skill.powerPoints - 1);
        
        // Calcul local simple pour éviter les problèmes d'API
        const damage = calculateDamageLocal(currentBattle.player, currentBattle.enemy, skill);
        
        // Appliquer les dégâts
        currentBattle.enemy.healthPoint -= damage;
        currentBattle.enemy.healthPoint = Math.max(0, currentBattle.enemy.healthPoint);
        
        // Log et affichage
        logMessage(`${currentBattle.player.name} utilise ${skill.name} !`);
        showDamageEffect(damage, 'enemy');
        
        // Mettre à jour l'affichage
        updateEnemyDisplay();
        await updateSkillButtons(); // Mettre à jour les PP
        
        // Vérifier si l'ennemi est KO
        if (currentBattle.enemy.healthPoint <= 0) {
            setTimeout(() => {
                playerWins();
            }, 1000);
            return;
        }
        
        logMessage(`${currentBattle.enemy.name} subît ${damage} points de dégâts !`);
        
        // Tour de l'ennemi après délai
        setTimeout(() => {
            enemyAttack();
        }, 1500);
        
    } catch (error) {
        console.error('Erreur pendant l\'attaque:', error);
        logMessage('Erreur pendant l\'attaque !');
        
        // Rétablir le tour du joueur en cas d'erreur
        currentBattle.isPlayerTurn = true;
        enableActions();
    }
}

// Enemy attacks - VERSION SIMPLIFIÉE
async function enemyAttack() {
    if (!currentBattle.battleActive) return;
    
    console.log('=== ATTAQUE ENNEMIE ===');
    
    const enemySkill = randomChoice(currentBattle.enemy.skills);
    
    // Calcul local simple
    const damage = calculateDamageLocal(currentBattle.enemy, currentBattle.player, enemySkill);
    
    // Appliquer les dégâts
    currentBattle.player.healthPoint -= damage;
    currentBattle.player.healthPoint = Math.max(0, currentBattle.player.healthPoint);
    
    // Log et affichage
    logMessage(`${currentBattle.enemy.name} utilise ${enemySkill.name} !`);
    showDamageEffect(damage, 'player');
    updatePlayerDisplay();
    
    // Vérifier si le joueur est KO
    if (currentBattle.player.healthPoint <= 0) {
        setTimeout(() => {
            playerLoses();
        }, 1000);
        return;
    }
    
    logMessage(`${currentBattle.player.name} subît ${damage} points de dégâts !`);
    
    // Tour du joueur
    setTimeout(() => {
        currentBattle.isPlayerTurn = true;
        enableActions();
    }, 1500);
}

// Calcul local de fallback - VERSION AMÉLIORÉE
function calculateDamageLocal(attacker, defender, skill) {
    console.log(`Calcul dégâts: ${attacker.name} -> ${defender.name} avec ${skill.name}`);
    
    // Formule de base Pokémon simplifiée
    const baseDamage = skill.damage;
    const attackStat = attacker.strength;
    const defenseStat = defender.defense;
    
    // Calcul principal
    let damage = Math.floor((baseDamage * (attackStat / defenseStat)) * 0.8);
    
    // Facteur aléatoire (85% à 100%)
    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);
    
    // Multiplicateur de type
    let typeMultiplier = 1.0;
    
    if (skill.type && defender.types) {
        // Efficacités de type simplifiées
        const typeChart = {
            'electric': { 'water': 2.0, 'flying': 2.0, 'ground': 0.0, 'grass': 0.5, 'electric': 0.5 },
            'water': { 'fire': 2.0, 'ground': 2.0, 'rock': 2.0, 'water': 0.5, 'grass': 0.5 },
            'fire': { 'grass': 2.0, 'ice': 2.0, 'bug': 2.0, 'fire': 0.5, 'water': 0.5, 'rock': 0.5 },
            'grass': { 'water': 2.0, 'ground': 2.0, 'rock': 2.0, 'fire': 0.5, 'grass': 0.5, 'flying': 0.5, 'bug': 0.5 },
            'normal': { 'ghost': 0.0 }
        };
        
        if (typeChart[skill.type]) {
            for (const defenderType of defender.types) {
                if (typeChart[skill.type][defenderType]) {
                    typeMultiplier *= typeChart[skill.type][defenderType];
                }
            }
        }
    }
    
    // Appliquer le multiplicateur de type
    damage = Math.floor(damage * typeMultiplier);
    
    // Dégâts minimum de 1
    damage = Math.max(1, damage);
    
    console.log(`Dégâts calculés: ${damage} (base: ${baseDamage}, type: x${typeMultiplier})`);
    
    return damage;
}

// Player wins the battle
async function playerWins() {
    currentBattle.battleActive = false;
    
    logMessage(`${currentBattle.enemy.name} est KO !`);
    logMessage('Vous remportez le combat !');
    
    // Calculate rewards
    const xpGain = randomInt(15, 35);
    const moneyGain = randomInt(10, 25);
    
    try {
        // Update player stats via API
        await API.player.update(xpGain, moneyGain);
        await loadPlayerStats();
        
        showResultScreen(true, xpGain, moneyGain);
        logMessage(`Vous gagnez ${xpGain} XP et ${moneyGain} Pokédollars !`);
        
    } catch (error) {
        console.error('Erreur mise à jour stats:', error);
        showResultScreen(true, xpGain, moneyGain);
    }
}

// Player loses the battle
function playerLoses() {
    currentBattle.battleActive = false;
    
    logMessage(`${currentBattle.player.name} est KO !`);
    logMessage('Vous perdez le combat...');
    
    showResultScreen(false, 0, 0);
}

// Run from battle
function runFromBattle() {
    if (!currentBattle.battleActive) return;
    
    currentBattle.battleActive = false;
    logMessage('Vous fuyez le combat !');
    
    setTimeout(() => {
        startNewBattle();
    }, 1000);
}

// Update skill buttons dynamiquement - VERSION CORRIGÉE
async function updateSkillButtons() {
    console.log('=== MISE À JOUR BOUTONS ATTAQUES ===');
    
    const skillButtonsContainer = document.getElementById('skill-buttons');
    if (!skillButtonsContainer) {
        console.error('Container skill-buttons non trouvé');
        return;
    }
    
    if (!currentBattle.player || !currentBattle.player.skills) {
        console.error('Pas de joueur ou de skills disponibles');
        skillButtonsContainer.innerHTML = '<div class="text-danger">Erreur: Pas d\'attaques disponibles</div>';
        return;
    }
    
    console.log('Skills du joueur:', currentBattle.player.skills);
    
    // CORRECTION: Vider et reconstruire sans boucle infinie
    skillButtonsContainer.innerHTML = '';
    
    // Limiter à 4 attaques maximum
    const skillsToShow = currentBattle.player.skills.slice(0, 4);
    
    if (skillsToShow.length === 0) {
        skillButtonsContainer.innerHTML = '<div class="text-warning">Aucune attaque disponible</div>';
        return;
    }
    
    skillsToShow.forEach((skill, index) => {
        const button = document.createElement('button');
        button.className = `skill-button ${skill.powerPoints <= 0 ? 'disabled' : ''}`;
        button.dataset.skillIndex = index;
        button.disabled = skill.powerPoints <= 0 || !currentBattle.battleActive || !currentBattle.isPlayerTurn;
        
        const typeIcon = getTypeIcon(skill.type);
        button.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <span>${typeIcon} ${skill.name}</span>
                <small class="ms-2">${skill.damage} DMG • ${skill.powerPoints} PP</small>
            </div>
        `;
        
        // CORRECTION: Event listener simple sans rebinding
        button.onclick = async function() {
            if (!currentBattle.battleActive || !currentBattle.isPlayerTurn) {
                console.log('Combat inactif ou pas le tour du joueur');
                return;
            }
            
            const skillIndex = parseInt(this.dataset.skillIndex);
            const selectedSkill = currentBattle.player.skills[skillIndex];
            
            if (selectedSkill && selectedSkill.powerPoints > 0) {
                console.log(`Utilisation de ${selectedSkill.name}`);
                await playerAttack(selectedSkill);
            } else {
                showNotification('Cette attaque n\'a plus de PP !', 'warning');
            }
        };
        
        skillButtonsContainer.appendChild(button);
    });
    
    console.log(`${skillsToShow.length} boutons d'attaque créés`);
}

// Get type icon
function getTypeIcon(type) {
    const icons = {
        'normal': '<i class="fas fa-fist-raised"></i>',
        'electric': '<i class="fas fa-bolt"></i>',
        'fire': '<i class="fas fa-fire"></i>',
        'water': '<i class="fas fa-tint"></i>',
        'grass': '<i class="fas fa-leaf"></i>',
        'ice': '<i class="fas fa-snowflake"></i>',
        'fighting': '<i class="fas fa-hand-rock"></i>',
        'poison': '<i class="fas fa-skull"></i>',
        'ground': '<i class="fas fa-mountain"></i>',
        'flying': '<i class="fas fa-feather"></i>',
        'psychic': '<i class="fas fa-brain"></i>',
        'bug': '<i class="fas fa-bug"></i>',
        'rock': '<i class="fas fa-gem"></i>',
        'ghost': '<i class="fas fa-ghost"></i>',
        'dragon': '<i class="fas fa-dragon"></i>',
        'dark': '<i class="fas fa-moon"></i>',
        'steel': '<i class="fas fa-cog"></i>',
        'fairy': '<i class="fas fa-magic"></i>'
    };
    
    return icons[type] || '<i class="fas fa-question"></i>';
}

// Show damage effect
function showDamageEffect(damage, target) {
    const targetElement = target === 'player' ? 
        document.getElementById('player-pokemon-sprite') : 
        document.getElementById('enemy-pokemon-sprite');
    
    if (!targetElement) return;
    
    // Shake animation
    targetElement.classList.add('shake');
    setTimeout(() => {
        targetElement.classList.remove('shake');
    }, 500);
    
    // Damage number
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.textContent = `-${damage}`;
    damageText.style.left = (targetElement.offsetLeft + 50) + 'px';
    damageText.style.top = (targetElement.offsetTop + 30) + 'px';
    
    targetElement.parentElement.appendChild(damageText);
    
    setTimeout(() => {
        if (damageText.parentElement) {
            damageText.parentElement.removeChild(damageText);
        }
    }, 1000);
}

// Update player display
function updatePlayerDisplay() {
    const pokemon = currentBattle.player;
    if (!pokemon) return;
    
    document.getElementById('player-pokemon-name').textContent = pokemon.name;
    document.getElementById('player-pokemon-sprite').src = 
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    
    const healthPercent = (pokemon.healthPoint / pokemon.maxHealthPoint) * 100;
    document.getElementById('player-health-fill').style.width = healthPercent + '%';
    document.getElementById('player-health-text').textContent = 
        `${pokemon.healthPoint}/${pokemon.maxHealthPoint} HP`;
    
    document.getElementById('player-attack').textContent = pokemon.strength;
    document.getElementById('player-defense').textContent = pokemon.defense;
}

// Update enemy display
function updateEnemyDisplay() {
    const pokemon = currentBattle.enemy;
    if (!pokemon) return;
    
    document.getElementById('enemy-pokemon-name').textContent = pokemon.name;
    document.getElementById('enemy-pokemon-sprite').src = 
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.sprite}.png`;
    
    const healthPercent = (pokemon.healthPoint / pokemon.maxHealthPoint) * 100;
    document.getElementById('enemy-health-fill').style.width = healthPercent + '%';
    document.getElementById('enemy-health-text').textContent = 
        `${pokemon.healthPoint}/${pokemon.maxHealthPoint} HP`;
    
    document.getElementById('enemy-attack').textContent = pokemon.strength;
    document.getElementById('enemy-defense').textContent = pokemon.defense;
}

// Update both displays
function updateDisplays() {
    updatePlayerDisplay();
    updateEnemyDisplay();
}

// Show result screen
function showResultScreen(victory, xp, money) {
    const resultElement = document.getElementById('battle-result');
    const rewardsElement = document.getElementById('rewards');
    
    if (victory) {
        resultElement.textContent = 'VICTOIRE !';
        resultElement.className = 'text-success';
        rewardsElement.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-trophy"></i> Récompenses :<br>
                <strong>+${xp} XP</strong><br>
                <strong>+${money} Pokédollars</strong>
            </div>
        `;
    } else {
        resultElement.textContent = 'DÉFAITE...';
        resultElement.className = 'text-danger';
        rewardsElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-skull"></i> Aucune récompense cette fois...
            </div>
        `;
    }
    
    document.getElementById('combat-actions').style.display = 'none';
    document.getElementById('battle-over').style.display = 'block';
}

// Hide result screen
function hideResultScreen() {
    document.getElementById('combat-actions').style.display = 'block';
    document.getElementById('battle-over').style.display = 'none';
    enableActions();
}

// Disable/Enable actions - VERSION CORRIGÉE
function disableActions() {
    document.querySelectorAll('.skill-button').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function enableActions() {
    document.querySelectorAll('.skill-button').forEach(btn => {
        // Ne réactiver que si la compétence a des PP
        const skillIndex = parseInt(btn.dataset.skillIndex);
        const skill = currentBattle.player?.skills?.[skillIndex];
        
        if (skill && skill.powerPoints > 0) {
            btn.disabled = false;
            btn.style.opacity = '1';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    });
}

// Add message to combat log avec limitation
function logMessage(message) {
    const log = document.getElementById('combat-log');
    if (!log) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `[${timestamp}] ${message}`;
    
    log.appendChild(messageDiv);
    log.scrollTop = log.scrollHeight;
    
    // Limiter à 50 messages pour éviter les problèmes de performance
    const messages = log.children;
    if (messages.length > 50) {
        log.removeChild(messages[0]);
    }
}

// Use potion - VERSION SIMPLIFIÉE
async function usePotion() {
    if (!currentBattle.battleActive || !currentBattle.isPlayerTurn) return;
    
    console.log('=== UTILISATION POTION ===');
    
    const healAmount = 50;
    const oldHealth = currentBattle.player.healthPoint;
    
    currentBattle.player.healthPoint = Math.min(
        currentBattle.player.maxHealthPoint,
        currentBattle.player.healthPoint + healAmount
    );
    
    const actualHeal = currentBattle.player.healthPoint - oldHealth;
    
    if (actualHeal > 0) {
        updatePlayerDisplay();
        logMessage(`Vous utilisez une Potion ! +${actualHeal} HP`);
        showNotification(`+${actualHeal} HP !`, 'success');
        
        // Fin du tour
        currentBattle.isPlayerTurn = false;
        disableActions();
        
        setTimeout(() => {
            enemyAttack();
        }, 1500);
    } else {
        logMessage('Votre Pokémon a déjà tous ses HP !');
        showNotification('HP déjà au maximum !', 'warning');
    }
}

// Show items (placeholder amélioré)
function showItems() {
    showNotification('Inventaire - Fonctionnalité à venir !', 'info');
}

// Utility functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

// Show notification function
function showNotification(message, type = 'info', duration = 3000) {
    // Essayer d'utiliser la fonction globale d'abord
    if (typeof window.showGlobalNotification === 'function') {
        window.showGlobalNotification(message, type, duration);
        return;
    }
    
    // Fallback notification simple
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
    
    notification.className = `alert ${alertClass} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border: none;
        border-radius: 10px;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${iconClass} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove après le délai
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 150);
        }
    }, duration);
}

// Debug functions (à enlever en production)
window.debugCombat = {
    getCurrentBattle: () => currentBattle,
    generateNewEnemy: generateRandomEnemy,
    testSkillButtons: updateSkillButtons,
    resetPlayerHP: () => {
        if (currentBattle.player) {
            currentBattle.player.healthPoint = currentBattle.player.maxHealthPoint;
            updatePlayerDisplay();
        }
    },
    resetEnemyHP: () => {
        if (currentBattle.enemy) {
            currentBattle.enemy.healthPoint = currentBattle.enemy.maxHealthPoint;
            updateEnemyDisplay();
        }
    },
    forcePlayerWin: () => {
        if (currentBattle.enemy) {
            currentBattle.enemy.healthPoint = 0;
            updateEnemyDisplay();
            playerWins();
        }
    }
};