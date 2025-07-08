using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Models;
using PokemonTeam.Services;

namespace PokemonTeam.Controllers;

[Authorize]
[Route("[controller]")]
public class PariPokeController : Controller
{
    private readonly PokemonDbContext _ctx;

    public PariPokeController(PokemonDbContext ctx)
    {
        _ctx = ctx;
    }

    [HttpGet("")]
    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// Place un pari en retirant les pokédollars.
    /// </summary>
    [HttpPost("bet")]
    public async Task<IActionResult> PlaceBet([FromBody] PlaceBetRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Unauthorized();

        var player = await _ctx.Players
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "PariPoke");

        if (player == null)
            return BadRequest(new { error = "Player not found." });

        if (player.Pokedollar < request.Amount)
            return BadRequest(new { error = "Not enough pokédollars." });

        player.Pokedollar -= request.Amount;
        await _ctx.SaveChangesAsync();

        return Ok(new { pokedollar = player.Pokedollar });
    }

    /// <summary>
    /// Crédite le gain après victoire.
    /// </summary>
    [HttpPost("win")]
    public async Task<IActionResult> Win([FromBody] WinRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Unauthorized();

        var player = await _ctx.Players
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "PariPoke");

        if (player == null)
            return BadRequest(new { error = "Player not found." });

        player.Pokedollar += request.Amount;
        await _ctx.SaveChangesAsync();

        return Ok(new { pokedollar = player.Pokedollar });
    }

    /// <summary>
    /// Utilise une compétence lors d'une course/pari.
    /// </summary>
    [HttpPost("useSkill")]
    public async Task<IActionResult> UseSkill([FromBody] UseSkillRequest request)
    {
        var skill = await _ctx.Skills
            .Include(s => s.TypeChart)
            .FirstOrDefaultAsync(s => s.Id == request.Skill.Id);

        if (skill == null)
            return NotFound(new { error = "Skill not found." });

        var attacker = await _ctx.Pokemons
            .Include(p => p.Types)
            .FirstOrDefaultAsync(p => p.Id == request.Attacker.Id);

        var target = await _ctx.Pokemons
            .Include(p => p.Types)
            .FirstOrDefaultAsync(p => p.Id == request.Target.Id);

        if (attacker == null || target == null)
            return NotFound(new { error = "Attacker or Target Pokémon not found." });

        var battleService = new BattleService(_ctx);

        try
        {
            var result = await battleService.UseSkill(skill, attacker, target);
            await _ctx.SaveChangesAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    public class PlaceBetRequest
    {
        public int Amount { get; set; }
    }

    public class WinRequest
    {
        public int Amount { get; set; }
    }
}
