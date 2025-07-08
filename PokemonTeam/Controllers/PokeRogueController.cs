using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Services;

namespace PokemonTeam.Controllers;

using Microsoft.AspNetCore.Mvc;

[Route("[controller]")] 
public class PokeRogueController : Controller
    {
        private readonly PokemonDbContext _ctx;
        public PokeRogueController(PokemonDbContext ctx)
        {
            _ctx = ctx;
        }
        [HttpGet("")]
        public IActionResult Index()
        {
            return View();
        }
        
        [HttpGet("SelectTeam")]
        public IActionResult SelectTeam()
        {
            return View();
        }
        
        [HttpGet("Combat")]
        public IActionResult Combat()
        {
            return View();
        }

        [HttpGet("Shop")]
        public IActionResult Shop()
        {
            return View();
        }

        [HttpPost("EndMatch")]
        public async Task<IActionResult> EndMatch([FromBody] List<string> PokemonNames)
        {
            if (PokemonNames == null || !PokemonNames.Any())
                return BadRequest("Aucun nom de Pokémon fourni.");

            var enemyPokemons = await _ctx.Pokemons
                .Where(p => PokemonNames.Contains(p.name))
                .ToListAsync();

            if (!enemyPokemons.Any())
                return NotFound("Aucun Pokémon trouvé.");

            foreach (var pokemon in enemyPokemons)
            {
                pokemon.healthPoint = pokemon.maxHealthPoint;
            }

            await _ctx.SaveChangesAsync();

            return Ok(new
            {
                message = "PV des Pokémon ennemis restaurés.",
                count = enemyPokemons.Count
            });
        }
        
        [HttpPost("PlayerAttack")]
        public async Task<IActionResult> PlayerAttack(string attackerName, string targetName, string skillName)
        {
            // tu peux aussi sécuriser avec l'email du user si besoin

            var attacker = await _ctx.Pokemons
                .Include(p => p.Types)
                .Include(p => p.Skill)
                .FirstOrDefaultAsync(p => p.name.ToLower() == attackerName.ToLower());

            var target = await _ctx.Pokemons
                .Include(p => p.Types)
                .FirstOrDefaultAsync(p => p.name.ToLower() == targetName.ToLower());

            if (attacker == null || target == null)
                return NotFound("Pokémon introuvable.");

            var skill = await _ctx.Skills
                .Include(s => s.TypeChart)
                .FirstOrDefaultAsync(s => s.Name == skillName);

            if (skill == null)
                return NotFound("Skill introuvable.");

            var battleService = new BattleService(_ctx);

            var result = await battleService.UseSkill(skill, attacker, target);

            await _ctx.SaveChangesAsync();

            return Ok(new
            {
                damage = result.DamageDealt,
                targetRemainingHP = target.healthPoint,
                attackerName = attacker.name,
                targetName = target.name
            });
        }
}