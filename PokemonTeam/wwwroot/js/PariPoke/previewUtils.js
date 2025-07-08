/**
 * Reconstruit les sprites preview des coureurs sélectionnés.
 * @param {string[]} selectedRunners La liste des coureurs sélectionnés.
 */
async function buildPreviewRunners(selectedRunners) {
    const track = document.getElementById('raceContainer');
    const paths = [
        document.getElementById('trackPath1'),
        document.getElementById('trackPath2'),
        document.getElementById('trackPath3'),
        document.getElementById('trackPath4')
    ];

    const totalLengths = paths.map(p => p.getTotalLength());
    const maxLength = Math.max(...totalLengths);
    let startOffsets = totalLengths.map(length => maxLength - length).reverse();

    // Nettoyer d'abord
    track.querySelectorAll('.preview-runner').forEach(img => img.remove());

    for (let i = 0; i < selectedRunners.length; i++) {
        const pokeName = selectedRunners[i];
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
        const data = await res.json();
        const spriteUrl = data.sprites.back_default;

        const point = paths[i].getPointAtLength(startOffsets[i]);

        const img = document.createElement('img');
        img.src = spriteUrl;
        img.className = 'preview-runner';
        img.dataset.name = pokeName;
        img.style.opacity = '0.7';
        img.style.position = 'absolute';
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.transform = `translate(${point.x - 25}px, ${point.y - 25}px)`;

        track.appendChild(img);
    }
}

window.PreviewUtils = {
    buildPreviewRunners: buildPreviewRunners
};
