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
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
            return Unauthorized();

        var player = await _ctx.Players
            .Include(p => p.Pokemons)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "pokeGacha");

        if (player == null)
            return BadRequest("Joueur introuvable.");

        if (player.Pokedollar < 10)
            return BadRequest(new { error = "Pas assez de pokédollars." });

        var random = new Random();
        var pokemonId = random.Next(1, 152);
        var pokemon = await _ctx.Pokemons.FindAsync(pokemonId);

        if (pokemon == null)
            return NotFound("Pokémon non trouvé.");

        player.Pokedollar -= 10;
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
            .ThenInclude(p => p.Types)
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
                .ThenInclude(p => p.Types)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == "pokeGacha");

        if (player == null || !player.Pokemons.Any())
            return BadRequest("Aucun Pokémon disponible pour le combat.");

        var playerPokemon = player.Pokemons.OrderBy(x => Guid.NewGuid()).First();

        var randomEnemyId = new Random().Next(1, 152);
        var enemyPokemon = await _ctx.Pokemons
            .Include(p => p.Types)
            .FirstOrDefaultAsync(p => p.Id == randomEnemyId);

        if (enemyPokemon == null)
            return NotFound("Aucun Pokémon ennemi trouvé.");

        var tackleSkill = await _ctx.Skills
            .Include(s => s.TypeChart)
            .FirstOrDefaultAsync(s => s.Id == 1);

        if (tackleSkill == null)
            return NotFound("Skill Tackle introuvable.");

        var history = new List<string>();

        history.Add($"<span style='color:green'>Ton {playerPokemon.name}</span> entre en combat contre <span style='color:red'>{enemyPokemon.name}</span> !");

        var battleService = new BattleService(_ctx);
        var playerTurn = playerPokemon.speed >= enemyPokemon.speed;
        var finished = false;

        while (!finished)
        {
            if (playerTurn)
            {
                var result = await battleService.UseSkill(tackleSkill, playerPokemon, enemyPokemon);

                history.Add($"<span style='color:green'>{playerPokemon.name}</span> attaque, <span style='color:red'>{enemyPokemon.name}</span> perd {result.DamageDealt} HP (PV restants {enemyPokemon.healthPoint})");

                if (enemyPokemon.healthPoint <= 0)
                {
                    history.Add($"<span style='color:green'>{playerPokemon.name}</span> a gagné !");
                    player.Pokedollar += 5;
                    finished = true;
                    break;
                }
            }
            else
            {
                var result = await battleService.UseSkill(tackleSkill, enemyPokemon, playerPokemon);

                history.Add($"<span style='color:red'>{enemyPokemon.name}</span> attaque, <span style='color:green'>{playerPokemon.name}</span> perd {result.DamageDealt} HP (PV restants {playerPokemon.healthPoint})");

                if (playerPokemon.healthPoint <= 0)
                {
                    history.Add($"<span style='color:red'>{enemyPokemon.name}</span> a gagné !");
                    if (new Random().NextDouble() < 0.1)
                    {
                        player.Pokemons.Remove(playerPokemon);
                        history.Add($"{playerPokemon.name} s'est enfui de peur !");
                    }
                    finished = true;
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
    