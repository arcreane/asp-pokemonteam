import { initPlayer } from "./player.js";
import { initDraw } from "./draw.js";
import { initBattle } from "./battle.js";
import { renderPokedex } from "./pokedex.js";

window.addEventListener("load", async () => {
    await initPlayer();
    initDraw();
    initBattle();
    renderPokedex();
});
    