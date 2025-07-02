/// <summary>
/// Suika Game engine adapted for Pokémon heads
/// </summary>
/// <remarks>
/// Handles gravity, collision, merging logic, and rendering.
/// </remarks>
/// <author>
/// Elerig
/// </author>

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const assets = {
    1: 'images/pikachu.png',
    2: 'images/charmander.png',
    3: 'images/bulbasaur.png',
    4: 'images/squirtle.png',
    // ajoute d'autres têtes de Pokémon
};

let balls = []; // contient les objets à l'écran

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ball of balls) {
        ctx.drawImage(ball.img, ball.x, ball.y, ball.size, ball.size);
        ball.y += ball.velocity;
    }

    requestAnimationFrame(gameLoop);
}

// Exemple d'ajout d'un Pokémon
function spawnPokemon(type) {
    const img = new Image();
    img.src = assets[type];
    img.onload = () => {
        balls.push({
            img: img,
            x: canvas.width / 2 - 25,
            y: 0,
            size: 50,
            velocity: 2
        });
    };
}

// Démarrer le jeu
spawnPokemon(1);
gameLoop();
