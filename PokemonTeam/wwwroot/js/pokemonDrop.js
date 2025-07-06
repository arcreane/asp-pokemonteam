/// <summary>
/// Suika Game prototype avec une tête de Pokémon
/// </summary>

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let balls = [];

const assets = {
    1: "/images/pikachu.png"  // Remplacer par le chemin exact
};

let currentPokemon = null;

function spawnPokemon(type) {
    const img = new Image();
    img.src = assets[type];
    img.onload = () => {
        currentPokemon = {
            img: img,
            x: canvas.width / 2 - 25,
            y: 0,
            size: 50,
            velocity: 0,
            dropped: false,
            type: type
        };
    };
}

document.addEventListener("keydown", (e) => {
    if (!currentPokemon || currentPokemon.dropped) return;
    if (e.key === "ArrowLeft") currentPokemon.x -= 10;
    if (e.key === "ArrowRight") currentPokemon.x += 10;
    if (e.key === " ") currentPokemon.dropped = true; // Drop
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentPokemon) {
        if (currentPokemon.dropped) currentPokemon.y += 2;
        ctx.drawImage(currentPokemon.img, currentPokemon.x, currentPokemon.y, currentPokemon.size, currentPokemon.size);

        if (currentPokemon.y >= canvas.height - currentPokemon.size) {
            balls.push(currentPokemon);
            currentPokemon = null;

            if (balls.length >= 5) {
                gainPoints(10);
            }

            spawnPokemon(1); // recommence
        }
    }

    for (let b of balls) {
        ctx.drawImage(b.img, b.x, b.y, b.size, b.size);
    }

    requestAnimationFrame(gameLoop);
}
function gainPoints(score) {
    fetch("/MiniGame/AddScore", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: score })
    }).then(res => {
        if (res.ok) {
            console.log("Score envoyé !");
        }
    });
}

spawnPokemon(1);
gameLoop();
