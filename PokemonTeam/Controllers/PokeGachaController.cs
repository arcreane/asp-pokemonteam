using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;

[Authorize]
public class PokeGachaController : Controller
{
    private readonly PokemonDbContext _ctx;

    public PokeGachaController(PokemonDbContext ctx)
    {
        _ctx = ctx;
    }

    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Pull()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        // on récupère le player pour pokeGacha
        var player = await _ctx.Players
            .FirstOrDefaultAsync(p => p.fk_user_auth == userId && p.Game == "pokeGacha");

        if (player == null)
        {
            return BadRequest(new { error = "Joueur introuvable." });
        }

        if (player.Pokedollar < 10)
            return BadRequest(new { error = "Pas assez de pokédollars." });

        player.Pokedollar -= 10;

        var random = new Random();
        var pokemonId = random.Next(1, 152);
        var pokemon = await _ctx.Pokemons.FindAsync(pokemonId);

        await _ctx.SaveChangesAsync();

        return Ok(new
        {
            pokedollar = player.Pokedollar,
            pokemon
        });
    }
}