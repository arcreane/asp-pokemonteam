import { currentPokedollar } from "./player.js";

export function initBattle() {
    const fightBtn = document.getElementById("fightBtn");
    const fightSound = document.getElementById("fightSound");
    const victorySound = document.getElementById("victorySound");

    fightBtn.addEventListener("click", () => {
        victorySound.pause();
        fightSound.pause();
        fightSound.currentTime = 0;
        fightSound.play();
        fightBtn.disabled = true;
        fightBtn.textContent = "⚔️ Ongoing fight...";
        document.getElementById("battleLog").innerHTML = "";

        fetch("/PokeGacha/StartBattle", { method: "POST" })
            .then(res => res.json())
            .then(data => {
                const logElement = document.getElementById("battleLog");
                let i = 0;

                document.getElementById("playerSprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.playerPokemonId}.png`;
                document.getElementById("enemySprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.enemyPokemonId}.png`;

                const interval = setInterval(() => {
                    if (i >= data.history.length) {
                        clearInterval(interval);
                        fightBtn.disabled = false;
                        fightBtn.textContent = "⚔️ Fight!";
                        document.getElementById("pokedollar").textContent = data.currentPokedollar;
                        if (data.history[data.history.length - 1].includes("won") && data.history[data.history.length - 1].includes("style='color:green'")) {
                            fightSound.pause();
                            victorySound.play();
                        }
                        return;
                    }

                    const line = document.createElement("div");
                    line.innerHTML = data.history[i];
                    logElement.appendChild(line);
                    logElement.scrollTop = logElement.scrollHeight;

                    const playerStarts = data.playerStarts;
                    const isPlayerTurn = (i % 2 === 1 && playerStarts) || (i % 2 === 0 && !playerStarts);
                    const sprite = document.getElementById(isPlayerTurn ? "playerSprite" : "enemySprite");
                    sprite.style.animation = isPlayerTurn ? "chargeReverse 0.5s forwards" : "charge 0.5s forwards";
                    setTimeout(() => sprite.style.animation = "", 500);

                    i++;
                }, 1000);
            })
            .catch(err => alert(err.message));
    });
}
