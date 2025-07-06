using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokemonTeam.Models;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Services;

[Authorize]
public class PokeGachaController : Controller
{
    private readonly PokemonDbContext _ctx;
    private readonly ITypeChartService _typeChartService;

    public PokeGachaController(PokemonDbContext ctx, ITypeChartService typeChartService)
    {
        _ctx = ctx;
        _typeChartService = typeChartService;
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

        var player = await _ctx.Players
            .FirstOrDefaultAsync(p => p.fk_user_auth == userId && p.Game == "pokeGacha");

        if (player == null)
            return BadRequest(new { error = "Joueur introuvable." });

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

    [HttpGet]
    public async Task<JsonResult> CapturedByMe()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _ctx.Players
            .Include(p => p.Pokemons)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "pokeGacha");

        if (player == null)
            return Json(new List<int>());

        var capturedIds = player.Pokemons.Select(p => p.Id).ToList();

        return Json(capturedIds);
    }

    [HttpPost]
    public async Task<IActionResult> StartBattle()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Unauthorized();

        var player = await _ctx.Players
            .Include(p => p.Pokemons)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "pokeGacha");

        if (player == null || player.Pokemons.Count == 0)
            return BadRequest("Aucun Pokémon pour combattre.");

        var playerPokemon = player.Pokemons.OrderBy(x => Guid.NewGuid()).First();

        var randomEnemyId = new Random().Next(1, 152);
        var enemyPokemon = await _ctx.Pokemons.FindAsync(randomEnemyId);

        if (enemyPokemon == null)
            return NotFound("Aucun Pokémon ennemi trouvé.");

        var playerInitialHp = playerPokemon.healthPoint;
        var enemyInitialHp = enemyPokemon.healthPoint;

        var tackleSkill = await _ctx.Skills
            .Include(s => s.TypeChart)
            .FirstOrDefaultAsync(s => s.Id == 1);

        if (tackleSkill == null)
            return NotFound("Skill Tackle introuvable");

        if (tackleSkill.TypeChart == null)
            return BadRequest("Le skill Tackle n'a pas de type associé en base.");

        var history = new List<string>();
        var playerTurn = playerPokemon.speed >= enemyPokemon.speed;
        var finished = false;

        while (!finished)
        {
            if (playerTurn)
            {
                var req = new UseSkillRequest
                {
                    Attacker = playerPokemon,
                    Target = enemyPokemon,
                    Skill = tackleSkill
                };

                var result = await tackleSkill.UseInBattle(req.Attacker, req.Target, _ctx);
                history.Add($"{playerPokemon.name} utilise Tackle et inflige {result.DamageDealt} dégâts (ennemi reste {enemyPokemon.healthPoint} HP)");

                if (enemyPokemon.healthPoint <= 0)
                {
                    finished = true;
                    history.Add("Le joueur a gagné !");
                    player.Pokedollar += 5;
                    break;
                }
            }
            else
            {
                var req = new UseSkillRequest
                {
                    Attacker = enemyPokemon,
                    Target = playerPokemon,
                    Skill = tackleSkill
                };

                var result = await tackleSkill.UseInBattle(req.Attacker, req.Target, _ctx);
                history.Add($"L'ennemi utilise Tackle et inflige {result.DamageDealt} dégâts (joueur reste {playerPokemon.healthPoint} HP)");

                if (playerPokemon.healthPoint <= 0)
                {
                    finished = true;
                    history.Add("L'ennemi a gagné !");
                    if (new Random().NextDouble() < 0.5)
                    {
                        player.Pokemons.Remove(playerPokemon);
                        history.Add($"{playerPokemon.name} s'est enfui de honte !");
                    }
                    break;
                }
            }

            playerTurn = !playerTurn;
            await Task.Delay(1000);
        }

        playerPokemon.healthPoint = playerPokemon.maxHealthPoint;
        enemyPokemon.healthPoint = enemyPokemon.maxHealthPoint;

        await _ctx.SaveChangesAsync();

        return Ok(new
        {
            history,
            playerPokemon = playerPokemon.name,
            enemyPokemon = enemyPokemon.name,
            currentPokedollar = player.Pokedollar
        });
    }
}
