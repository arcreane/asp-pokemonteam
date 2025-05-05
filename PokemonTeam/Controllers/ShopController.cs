#if false

namespace PokemonTeam.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    /// <summary>
    /// Controller responsible for managing the shop and purchasing objects.
    /// </summary>
    /// <author>
    /// Elerig
    /// </author>
    [Route("api/[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {
        private readonly ArenaContext _context;

        /// <summary>
        /// Constructor injecting the ArenaContext.
        /// </summary>
        /// <param name="context">Database context</param>
        public ShopController(ArenaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves the list of available objects in the shop.
        /// </summary>
        /// <returns>List of objects</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Objet>>> GetShopItems()
        {
            return await _context.Objets.ToListAsync();
        }

        /// <summary>
        /// Allows a player to buy an object using their Pokedollars.
        /// </summary>
        /// <param name="playerId">ID of the player</param>
        /// <param name="objetId">ID of the object</param>
        /// <returns>Status of the purchase</returns>
        [HttpPost("buy/{playerId}/{objetId}")]
        public async Task<IActionResult> BuyItem(int playerId, int objetId)
        {
            var player = await _context.Players.FindAsync(playerId);
            var objet = await _context.Objets.FindAsync(objetId);

            if (player == null || objet == null)
                return NotFound("Joueur ou objet introuvable");

            if (player.Pokedollar < objet.Price)
                return BadRequest("Fonds insuffisants");

            player.Pokedollar -= objet.Price;

            _context.PlayerObjects.Add(new PlayerObject
            {
                FkPlayer = playerId,
                FkObject = objetId
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Achat réussi",
                soldeRestant = player.Pokedollar
            });
        }
    }

}
#endif