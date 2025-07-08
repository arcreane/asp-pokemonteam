// === COMBAT SYSTEM COMPLET AVEC PROGRESSION ===

let currentBattle = {
    player: null,
    enemy: null,
    isPlayerTurn: true,
    battleActive: false
};

let battleStats = {
    battlesWon: 0,
    pokemonCaptured: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0
};

// === INITIALISATION ===

// Initialize combat system
async function initializeCombat() {
    console.log('=== INITIALISATION COMBAT AVEC PROGRESSION ===');
    
    try {
        // Charger les statistiques
        loadBattleStats();
        
        // Charger le Pokémon du joueur
        await setupPlayerPokemon();
        
        // Configurer les event listeners
        setupEventListeners();
        
        // Démarrer le premier combat
        await startNewBattle();
        
        console.log('Combat initialisé avec succès');
    } catch (error) {
        console.error('Erreur initialisation combat:', error);
        showErrorMessage();
    }
}

// === SETUP POKEMON JOUEUR ===

// Setup player's Pokémon depuis l'API
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

// === GÉNÉRATION ENNEMIS ===

// Generate balanced enemy based on player level
async function generateBalancedEnemy() {
    const playerLevel = Math.floor((currentBattle.player.strength + currentBattle.player.defense + currentBattle.player.speed) / 60) + 1;
    console.log(`Génération ennemi pour niveau joueur: ${playerLevel}`);
    
    try {
        // Générer un ID aléatoire
        const randomId = Math.floor(Math.random() * 151) + 1;
        const response = await fetch(`/Pokemon/getPokemonById/${randomId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const pokemonData = await response.json();
            
            // Équilibrer les stats en fonction du niveau du joueur
            const difficultyMultiplier = 0.8 + (playerLevel * 0.1); // 0.8 à 1.3
            const variationFactor = 0.9 + (Math.random() * 0.2); // 0.9 à 1.1
            
            const finalMultiplier = Math.min(1.5, difficultyMultiplier * variationFactor);
            
            const balancedEnemy = {
                id: pokemonData.id,
                name: pokemonData.name,
                types: pokemonData.types || ['normal'],
                healthPoint: Math.floor(pokemonData.healthPoint * finalMultiplier),
                maxHealthPoint: Math.floor(pokemonData.maxHealthPoint * finalMultiplier),
                strength: Math.floor(pokemonData.strength * finalMultiplier),
                defense: Math.floor(pokemonData.defense * finalMultiplier),
                speed: Math.floor(pokemonData.speed * finalMultiplier),
                sprite: pokemonData.id.toString(),
                skills: []
            };
            
            // Équilibrer les skills
            if (pokemonData.skills && pokemonData.skills.length > 0) {
                balancedEnemy.skills = pokemonData.skills.slice(0, 2).map(skill => ({
                    id: skill.id,
                    name: skill.name,
                    damage: Math.floor(skill.damage * finalMultiplier),
                    type: skill.type,
                    powerPoints: skill.powerPoints
                }));
            } else {
                balancedEnemy.skills = [{
                    id: 1,
                    name: 'Tackle',
                    damage: Math.floor(40 * finalMultiplier),
                    type: 'normal',
                    powerPoints: 20
                }];
            }
            
            console.log(`Ennemi équilibré généré (x${finalMultiplier.toFixed(2)}):`, balancedEnemy);
            return balancedEnemy;
        }
    } catch (error) {
        console.error('Erreur génération ennemi équilibré:', error);
    }
    
    // Fallback avec équilibrage manuel
    return generateFallbackEnemy(playerLevel);
}

// Generate fallback enemy with level scaling
function generateFallbackEnemy(playerLevel) {
    const enemies = [
        { id: 19, name: 'Rattata', sprite: '19', hp: 50, str: 35, def: 25, type: 'normal' },
        { id: 16, name: 'Pidgey', sprite: '16', hp: 45, str: 30, def: 20, type: 'flying' },
        { id: 13, name: 'Weedle', sprite: '13', hp: 40, str: 25, def: 20, type: 'bug' },
        { id: 10, name: 'Caterpie', sprite: '10', hp: 45, str: 20, def: 15, type: 'bug' },
        { id: 21, name: 'Spearow', sprite: '21', hp: 40, str: 35, def: 20, type: 'flying' },
        { id: 23, name: 'Ekans', sprite: '23', hp: 35, str: 40, def: 25, type: 'poison' },
        { id: 27, name: 'Sandshrew', sprite: '27', hp: 50, str: 30, def: 35, type: 'ground' },
        { id: 29, name: 'Nidoran♀', sprite: '29', hp: 55, str: 25, def: 25, type: 'poison' }
    ];
    
    const template = enemies[Math.floor(Math.random() * enemies.length)];
    const levelMultiplier = Math.max(0.5, 0.8 + (playerLevel * 0.15));
    
    return {
        id: template.id,
        name: template.name,
        types: [template.type],
        healthPoint: Math.floor(template.hp * levelMultiplier),
        maxHealthPoint: Math.floor(template.hp * levelMultiplier),
        strength: Math.floor(template.str * levelMultiplier),
        defense: Math.floor(template.def * levelMultiplier),
        speed: Math.floor((25 + Math.random() * 20) * levelMultiplier),
        sprite: template.sprite,
        skills: [{
            id: 1,
            name: 'Tackle',
            damage: Math.floor(35 * levelMultiplier),
            type: 'normal',
            powerPoints: 20
        }]
    };
}

// === GESTION DES COMBATS ===

// Start a new battle
async function startNewBattle() {
    console.log('=== DÉMARRAGE NOUVEAU COMBAT ÉQUILIBRÉ ===');
    
    try {
        // Générer un ennemi équilibré
        currentBattle.enemy = await generateBalancedEnemy();
        
        if (!currentBattle.enemy) {
            throw new Error('Impossible de générer un ennemi');
        }
        
        currentBattle.isPlayerTurn = true;
        currentBattle.battleActive = true;
        
        // Reset des PP des attaques
        if (currentBattle.player) {
            currentBattle.player.skills.forEach(skill => {
                if (skill.powerPoints <= 0) {
                    if (skill.id === 1) skill.powerPoints = 35; // Tackle
                    if (skill.id === 5) skill.powerPoints = 30; // Thunder Shock
                }
            });
        }
        
        updateDisplays();
        hideResultScreen();
        await updateSkillButtons();
        
        logMessage(`Un ${currentBattle.enemy.name} sauvage apparaît !`);
        logMessage('À vous de jouer !');
        
        // Afficher un conseil après un délai
        setTimeout(showBattleTip, 3000);
        
    } catch (error) {
        console.error('Erreur démarrage combat:', error);
        showNotification('Erreur lors du démarrage du combat', 'error');
    }
}

// === ATTAQUES ===

// Player attacks
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
        
        // Calcul des dégâts
        const damage = calculateDamageLocal(currentBattle.player, currentBattle.enemy, skill);
        
        // Appliquer les dégâts
        currentBattle.enemy.healthPoint -= damage;
        currentBattle.enemy.healthPoint = Math.max(0, currentBattle.enemy.healthPoint);
        
        // Log et affichage
        logMessage(`${currentBattle.player.name} utilise ${skill.name} !`);
        showDamageEffect(damage, 'enemy');
        
        // Mettre à jour l'affichage
        updateEnemyDisplay();
        await updateSkillButtons();
        
        // Statistiques
        battleStats.totalDamageDealt += damage;
        
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

// Enemy attacks
async function enemyAttack() {
    if (!currentBattle.battleActive) return;
    
    console.log('=== ATTAQUE ENNEMIE ===');
    
    const enemySkill = randomChoice(currentBattle.enemy.skills);
    
    // Calcul des dégâts
    const damage = calculateDamageLocal(currentBattle.enemy, currentBattle.player, enemySkill);
    
    // Appliquer les dégâts
    currentBattle.player.healthPoint -= damage;
    currentBattle.player.healthPoint = Math.max(0, currentBattle.player.healthPoint);
    
    // Log et affichage
    logMessage(`${currentBattle.enemy.name} utilise ${enemySkill.name} !`);
    showDamageEffect(damage, 'player');
    updatePlayerDisplay();
    
    // Statistiques
    battleStats.totalDamageReceived += damage;
    
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

// === CALCUL DÉGÂTS ===

// Calcul local des dégâts
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

// === VICTOIRE/DÉFAITE ===

// Player wins the battle
async function playerWins() {
    currentBattle.battleActive = false;
    
    logMessage(`${currentBattle.enemy.name} est KO !`);
    logMessage('Vous remportez le combat !');
    
    // Calculate rewards basés sur l'ennemi vaincu
    const enemyLevel = Math.floor((currentBattle.enemy.strength + currentBattle.enemy.defense) / 20);
    const baseXp = 15 + (enemyLevel * 5);
    const baseMoney = 10 + (enemyLevel * 3);
    
    // Bonus si c'était un combat difficile
    const levelDifference = enemyLevel - Math.floor(currentBattle.player.strength / 20);
    const difficultyBonus = Math.max(0, levelDifference * 5);
    
    const xpGain = baseXp + difficultyBonus;
    const moneyGain = baseMoney + Math.floor(difficultyBonus / 2);
    
    try {
        // Update player stats
        await API.player.update(xpGain, moneyGain);
        
        // Améliorer le Pokémon du joueur
        const pokemonUpdate = await fetch('/api/player/update-pokemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                game: 'Arena',
                xpGained: xpGain
            })
        });
        
        let pokemonImprovement = null;
        if (pokemonUpdate.ok) {
            pokemonImprovement = await pokemonUpdate.json();
            
            // Mettre à jour les stats locales du Pokémon
            if (pokemonImprovement.newStats) {
                currentBattle.player.healthPoint = pokemonImprovement.newStats.hp;
                currentBattle.player.maxHealthPoint = pokemonImprovement.newStats.maxHp;
                currentBattle.player.strength = pokemonImprovement.newStats.strength;
                currentBattle.player.defense = pokemonImprovement.newStats.defense;
                currentBattle.player.speed = pokemonImprovement.newStats.speed;
            }
        }
        
        await loadPlayerStats();
        
        // Mettre à jour les statistiques
        updateBattleStats(true);
        
        showResultScreen(true, xpGain, moneyGain, pokemonImprovement);
        
        let message = `Vous gagnez ${xpGain} XP et ${moneyGain} Pokédollars !`;
        if (pokemonImprovement && pokemonImprovement.improvements) {
            const improvements = pokemonImprovement.improvements;
            message += `\n${currentBattle.player.name} s'améliore ! `;
            if (improvements.hp > 0) message += `HP +${improvements.hp} `;
            if (improvements.strength > 0) message += `ATK +${improvements.strength} `;
            if (improvements.defense > 0) message += `DEF +${improvements.defense} `;
            if (improvements.speed > 0) message += `SPD +${improvements.speed}`;
        }
        
        logMessage(message);
        
        // Chance de capturer l'ennemi vaincu
        if (Math.random() < 0.3) { // 30% de chance
            showCaptureOpportunity();
        }
        
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

// === SYSTÈME DE CAPTURE ===

// Opportunité de capture
function showCaptureOpportunity() {
    const captureDiv = document.createElement('div');
    captureDiv.id = 'capture-opportunity';
    captureDiv.className = 'alert alert-info mt-3';
    captureDiv.innerHTML = `
        <div class="text-center">
            <i class="fas fa-hand-paper fa-2x mb-2"></i><br>
            <strong>Opportunité de capture !</strong><br>
            <small>Voulez-vous essayer de capturer ${currentBattle.enemy.name} ?</small><br>
            <small class="text-muted">Coût: 100 Pokédollars</small><br>
            <button class="btn btn-primary btn-sm mt-2 me-2" onclick="attemptCapture()">
                <i class="fas fa-hand-rock"></i> Capturer
            </button>
            <button class="btn btn-secondary btn-sm mt-2" onclick="skipCapture()">
                Ignorer
            </button>
        </div>
    `;
    
    document.getElementById('rewards').appendChild(captureDiv);
}

// Tentative de capture
async function attemptCapture() {
    try {
        const response = await fetch('/api/player/capture-pokemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                game: 'Arena',
                pokemonId: currentBattle.enemy.id
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                showNotification(`${currentBattle.enemy.name} capturé avec succès ! +${result.bonusXp} XP bonus`, 'success', 4000);
                logMessage(`${currentBattle.enemy.name} capturé ! Coût: 100 Pokédollars`);
                battleStats.pokemonCaptured++;
                updateBattleStats(false);
            } else {
                showNotification(result.message, 'warning', 3000);
                logMessage(`Échec de capture (${result.chanceUsed}% de chance)`);
            }
            
            await loadPlayerStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Erreur lors de la capture', 'error');
        }
    } catch (error) {
        console.error('Erreur capture:', error);
        showNotification('Erreur lors de la capture', 'error');
    }
    
    skipCapture();
}

// Ignorer la capture
function skipCapture() {
    const captureDiv = document.getElementById('capture-opportunity');
    if (captureDiv) {
        captureDiv.remove();
    }
}

// === SYSTÈME D'OBJETS ===

// Use potion
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

// Heal completely
async function healCompletely() {
    try {
        const response = await fetch('/api/player/heal-pokemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ game: 'Arena' })
        });
        
        if (response.ok) {
            if (currentBattle.player) {
                currentBattle.player.healthPoint = currentBattle.player.maxHealthPoint;
                updatePlayerDisplay();
            }
            
            showNotification('Pokémon complètement soigné !', 'success');
            logMessage('Pokémon soigné au centre Pokémon !');
        } else {
            throw new Error('Erreur API');
        }
    } catch (error) {
        console.error('Erreur soins complets:', error);
        showNotification('Erreur lors des soins', 'error');
    }
}

// === INTERFACE UTILISATEUR ===

// Update skill buttons
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
    
    skillButtonsContainer.innerHTML = '';
    
    // Limiter à 4 attaques maximum
    const skillsToShow = currentBattle.player.skills.slice(0, 4);
    
    if (skillsToShow.length === 0) {
        skillButtonsContainer.innerHTML = '<div class="text-warning">Aucune attaque disponible</div>';
        return;
    }
    
    skillsToShow.forEach((skill, index) => {
        const button = document.createElement('button');
        button.className = `skill-button btn btn-primary mb-2 me-2 ${skill.powerPoints <= 0 ? 'disabled' : ''}`;
        button.dataset.skillIndex = index;
        button.disabled = skill.powerPoints <= 0 || !currentBattle.battleActive || !currentBattle.isPlayerTurn;
        
        const typeIcon = getTypeIcon(skill.type);
        button.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <span>${typeIcon} ${skill.name}</span>
                <small class="ms-2">${skill.damage} DMG • ${skill.powerPoints} PP</small>
            </div>
        `;
        
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

// Setup event listeners
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

// === AFFICHAGE ===

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
    
    // Couleur de la barre de vie
    const healthBar = document.getElementById('player-health-fill');
    if (healthPercent > 60) {
        healthBar.className = 'health-fill bg-success';
    } else if (healthPercent > 30) {
        healthBar.className = 'health-fill bg-warning';
    } else {
        healthBar.className = 'health-fill bg-danger';
    }
    
    document.getElementById('player-attack').textContent = pokemon.strength;
    document.getElementById('player-defense').textContent = pokemon.defense;
    
    const speedElement = document.getElementById('player-speed');
    if (speedElement) speedElement.textContent = pokemon.speed;
    
    // Calculer et afficher le niveau basé sur les stats
    const level = Math.floor((pokemon.strength + pokemon.defense + pokemon.speed) / 60) + 1;
    const levelElement = document.getElementById('player-level');
    if (levelElement) levelElement.textContent = level;
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
    
    // Couleur de la barre de vie
    const healthBar = document.getElementById('enemy-health-fill');
    if (healthPercent > 60) {
        healthBar.className = 'health-fill bg-success';
    } else if (healthPercent > 30) {
        healthBar.className = 'health-fill bg-warning';
    } else {
        healthBar.className = 'health-fill bg-danger';
    }
    
    document.getElementById('enemy-attack').textContent = pokemon.strength;
    document.getElementById('enemy-defense').textContent = pokemon.defense;
    
    const speedElement = document.getElementById('enemy-speed');
    if (speedElement) speedElement.textContent = pokemon.speed;
    
    // Afficher les types
    const typesElement = document.getElementById('enemy-types');
    if (typesElement && pokemon.types) {
        const typeIcons = pokemon.types.map(type => getTypeIcon(type)).join(' ');
        typesElement.innerHTML = typeIcons;
    }
}

// Update both displays
function updateDisplays() {
    updatePlayerDisplay();
    updateEnemyDisplay();
}

// Show result screen
function showResultScreen(victory, xp, money, pokemonImprovement = null) {
    const resultElement = document.getElementById('battle-result');
    const rewardsElement = document.getElementById('rewards');
    
    if (victory) {
        resultElement.textContent = 'VICTOIRE !';
        resultElement.className = 'text-success';
        
        let rewardsHTML = `
            <div class="alert alert-success">
                <i class="fas fa-trophy"></i> Récompenses :<br>
                <strong>+${xp} XP</strong><br>
                <strong>+${money} Pokédollars</strong>
        `;
        
        // Afficher les améliorations de Pokémon
        if (pokemonImprovement && pokemonImprovement.improvements) {
            const imp = pokemonImprovement.improvements;
            rewardsHTML += `<br><br><i class="fas fa-arrow-up text-warning"></i> <strong>${currentBattle.player.name} s'améliore !</strong><br>`;
            if (imp.hp > 0) rewardsHTML += `<small>HP +${imp.hp}</small><br>`;
            if (imp.strength > 0) rewardsHTML += `<small>Force +${imp.strength}</small><br>`;
            if (imp.defense > 0) rewardsHTML += `<small>Défense +${imp.defense}</small><br>`;
            if (imp.speed > 0) rewardsHTML += `<small>Vitesse +${imp.speed}</small><br>`;
        }
        
        rewardsHTML += `</div>`;
        rewardsElement.innerHTML = rewardsHTML;
    } else {
        resultElement.textContent = 'DÉFAITE...';
        resultElement.className = 'text-danger';
        rewardsElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-skull"></i> Aucune récompense cette fois...<br>
                <small>Votre Pokémon a besoin de soins !</small>
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

// === CONSEILS ET ASTUCES ===

// Show battle tips
function showBattleTip() {
    const tips = [];
    
    if (currentBattle.player && currentBattle.enemy) {
        const playerHP = currentBattle.player.healthPoint / currentBattle.player.maxHealthPoint;
        
        if (playerHP < 0.3) {
            tips.push("💡 Votre Pokémon est faible ! Utilisez une potion ou allez au centre Pokémon.");
        }
        
        if (currentBattle.player.speed > currentBattle.enemy.speed) {
            tips.push("💡 Vous êtes plus rapide ! Profitez-en pour attaquer en premier.");
        }
        
        if (currentBattle.enemy.defense > currentBattle.player.strength) {
            tips.push("💡 L'ennemi a une forte défense. Cherchez des attaques spéciales.");
        }
        
        // Conseils de type
        if (currentBattle.player.skills) {
            const electricSkill = currentBattle.player.skills.find(s => s.type === 'electric');
            if (electricSkill && currentBattle.enemy.types.includes('water')) {
                tips.push("💡 Attaque électrique super efficace contre l'eau !");
            }
        }
    }
    
    if (tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTimeout(() => {
            logMessage(randomTip);
        }, 2000);
    }
}

// === GESTION ACTIONS ===

// Disable/Enable actions
function disableActions() {
    document.querySelectorAll('.skill-button').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function enableActions() {
    document.querySelectorAll('.skill-button').forEach(btn => {
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

// Run from battle
function runFromBattle() {
    if (!currentBattle.battleActive) return;
    
    currentBattle.battleActive = false;
    logMessage('Vous fuyez le combat !');
    
    setTimeout(() => {
        startNewBattle();
    }, 1000);
}

// === EFFETS VISUELS ===

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
    damageText.style.cssText = `
        position: absolute;
        font-size: 24px;
        font-weight: bold;
        color: #ff4757;
        animation: damage-float 1s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        left: ${targetElement.offsetLeft + 50}px;
        top: ${targetElement.offsetTop + 30}px;
    `;
    
    targetElement.parentElement.appendChild(damageText);
    
    setTimeout(() => {
        if (damageText.parentElement) {
            damageText.parentElement.removeChild(damageText);
        }
    }, 1000);
}

// === STATISTIQUES ===

// Update battle statistics
function updateBattleStats(won, damageDealt = 0, damageReceived = 0) {
    if (won) {
        battleStats.battlesWon++;
        const battlesWonElement = document.getElementById('battles-won');
        if (battlesWonElement) battlesWonElement.textContent = battleStats.battlesWon;
    }
    
    battleStats.totalDamageDealt += damageDealt;
    battleStats.totalDamageReceived += damageReceived;
    
    // Sauvegarder dans localStorage
    localStorage.setItem('battleStats', JSON.stringify(battleStats));
    
    // Mettre à jour l'affichage des captures
    const capturedElement = document.getElementById('pokemon-captured');
    if (capturedElement) capturedElement.textContent = battleStats.pokemonCaptured;
}

// Load battle statistics
function loadBattleStats() {
    const saved = localStorage.getItem('battleStats');
    if (saved) {
        battleStats = JSON.parse(saved);
        const battlesWonElement = document.getElementById('battles-won');
        const capturedElement = document.getElementById('pokemon-captured');
        
        if (battlesWonElement) battlesWonElement.textContent = battleStats.battlesWon;
        if (capturedElement) capturedElement.textContent = battleStats.pokemonCaptured;
    }
}

// === UTILITAIRES ===

// Get type icon
function getTypeIcon(type) {
    const icons = {
        'normal': '<i class="fas fa-fist-raised text-secondary"></i>',
        'electric': '<i class="fas fa-bolt text-warning"></i>',
        'fire': '<i class="fas fa-fire text-danger"></i>',
        'water': '<i class="fas fa-tint text-primary"></i>',
        'grass': '<i class="fas fa-leaf text-success"></i>',
        'ice': '<i class="fas fa-snowflake text-info"></i>',
        'fighting': '<i class="fas fa-hand-rock text-dark"></i>',
        'poison': '<i class="fas fa-skull text-purple"></i>',
        'ground': '<i class="fas fa-mountain text-warning"></i>',
        'flying': '<i class="fas fa-feather text-info"></i>',
        'psychic': '<i class="fas fa-brain text-pink"></i>',
        'bug': '<i class="fas fa-bug text-success"></i>',
        'rock': '<i class="fas fa-gem text-secondary"></i>',
        'ghost': '<i class="fas fa-ghost text-dark"></i>',
        'dragon': '<i class="fas fa-dragon text-primary"></i>',
        'dark': '<i class="fas fa-moon text-dark"></i>',
        'steel': '<i class="fas fa-cog text-secondary"></i>',
        'fairy': '<i class="fas fa-magic text-pink"></i>'
    };
    
    return icons[type] || '<i class="fas fa-question text-muted"></i>';
}

// Utility functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

// Show items (placeholder)
function showItems() {
    showNotification('Inventaire - Fonctionnalité à venir !', 'info');
}

// Add message to combat log
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

// Show error message
function showErrorMessage() {
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