export let currentPokedollar = 0;
export let capturedPokemonIds = [];

export async function initPlayer() {
    const game = "pokeGacha";

    try {
        const res = await fetch(`/api/player/me?game=${game}`);
        let player;
        if (res.status === 404) {
            const createRes = await fetch("/api/player/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: `${game}-player`, game })
            });
            player = await createRes.json();
        } else if (!res.ok) {
            throw new Error("Erreur lors de la récupération du joueur");
        } else {
            player = await res.json();
        }

        document.getElementById("pokedollar").textContent = player.pokedollar;
        currentPokedollar = player.pokedollar;

        const pokedexRes = await fetch("/PokeGacha/CapturedByMe");
        if (!pokedexRes.ok) throw new Error("Cannot load the pokédex.");

        capturedPokemonIds = await pokedexRes.json();

    } catch (err) {
        console.error(err);
        document.getElementById("pokedexLoading").innerHTML = `<p style="color:red">Error while loading Pokédex</p>`;
    }
}