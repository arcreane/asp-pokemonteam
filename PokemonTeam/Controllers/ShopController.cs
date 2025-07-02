/// <summary>
/// Controller responsible for listing shop items and processing purchases.
/// </summary>
/// <remarks>
/// Endpoints :
/// <list type="bullet">
///   <item><description>GET <c>/api/Shop</c> : retourne tous les objets.</description></item>
///   <item><description>POST <c>/api/Shop/buy/{playerId}/{objetId}</c> : tente un achat.</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
namespace PokemonTeam.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using PokemonTeam.Data;
    using PokemonTeam.Models;

    [Route("api/[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        /// <summary>
        /// Injecte le <see cref="ArenaContext"/>.
        /// </summary>
        public ShopController(PokemonDbContext context) => _context = context;

        /// <summary>
        /// Retourne tous les objets disponibles.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Objet>>> GetShopItems()
            => await _context.Objets.AsNoTracking().ToListAsync();

        /// <summary>
        /// Achète un objet pour un joueur après vérification du solde.
        /// </summary>
        /// <param name="playerId">Identifiant du joueur.</param>
        /// <param name="objetId">Identifiant de l’objet.</param>
        [HttpPost("buy/{playerId:int}/{objetId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuyItem(int playerId, int objetId)
        {
            var player = await _context.Players
                                       .Include(p => p.PlayerObjects)
                                       .SingleOrDefaultAsync(p => p.PlayerId == playerId);

            var objet = await _context.Objets.FindAsync(objetId);

            if (player is null || objet is null)
                return NotFound("Joueur ou objet introuvable.");

            if (player.Pokedollar < objet.Price)
                return BadRequest("Fonds insuffisants.");

            // Débit
            player.Pokedollar -= objet.Price;

            // Attribution de l’objet
            _context.PlayerObjects.Add(new PlayerObject
            {
                FkPlayer = playerId,
                FkObject = objetId,
                PurchaseDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Achat réussi.",
                soldeRestant = player.Pokedollar,
                objet = new { objet.ObjetId, objet.Name, objet.Description }
            });
        }
    }
}
