using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Exceptions;
using PokemonTeam.Models;

namespace PokemonTeam.Controllers;

/// <summary>
/// This class represents a Pokémon controller with enhanced functionality.
/// </summary>
[ApiController]
[Route("[controller]")]
public class PokemonController : ControllerBase
{
    private readonly PokemonDbContext _ctx;

    public PokemonController(PokemonDbContext ctx) => _ctx = ctx;

    /// <summary>
    /// This method allows a Pokémon to use a skill.
    /// </summary>
    [HttpPost("UseSkill")]
    public async Task<ActionResult<UseSkillResponse>> UseSkill([FromBody] UseSkillRequest request)
    {
        try
        {
            Skill skill = request.Skill;
            Pokemon attacker = request.Attacker;
            Pokemon target = request.Target;

            if (skill.PowerPoints > 0)
            {
                skill.PowerPoints--;

                // Utiliser l'API TypeChart pour obtenir les multiplicateurs réels
                double typeMultiplier = await TypeChart.GetDamageMultiplierAsync(_ctx, skill.Type, target.types.ToArray());
                double damage = (skill.Damage * (attacker.strength / (double)target.defense)) * typeMultiplier;
                int finalDamage = Math.Max(1, (int)damage);

                target.healthPoint -= (short)finalDamage;
                target.healthPoint = (short)Math.Max((short)0, target.healthPoint);

                var response = new UseSkillResponse(finalDamage, target);
                return Ok(response);
            }
            else
            {
                throw new NotEnoughPowerPointsException("Not enough power points to use this skill.");
            }
        }
        catch (NotEnoughPowerPointsException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur UseSkill: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de l'utilisation de la compétence" });
        }
    }

    /// <summary>
    /// This method retrieves a Pokémon by its ID with enhanced data.
    /// </summary>
    [HttpGet("getPokemonById/{id}")]
    public async Task<ActionResult<object>> GetPokemonById(int id)
    {
        try
        {
            var pokemon = await _ctx.Pokemons.FindAsync(id);

            if (pokemon == null)
            {
                return NotFound(new { error = "Pokémon not found." });
            }

            // Récupérer les types du Pokémon depuis la table de liaison
            var pokemonTypes = await _ctx.Database
                .SqlQuery<string>($@"
                    SELECT t.typeName 
                    FROM pokemon_type pt 
                    INNER JOIN type t ON pt.fk_type = t.id 
                    WHERE pt.fk_pokemon = {id}")
                .ToListAsync();

            // Récupérer les skills du Pokémon
            var pokemonSkills = await _ctx.Database
                .SqlQuery<int>($@"
                    SELECT ps.fk_skill 
                    FROM pokemon_skill ps 
                    WHERE ps.fk_pokemon = {id}")
                .ToListAsync();

            var skills = await _ctx.Skills
                .Include(s => s.TypeChart)
                .Where(s => pokemonSkills.Contains(s.Id))
                .ToListAsync();

            // Retourner un objet enrichi
            var enrichedPokemon = new
            {
                id = pokemon.Id,
                name = pokemon.name,
                types = pokemonTypes,
                healthPoint = pokemon.healthPoint,
                maxHealthPoint = pokemon.maxHealthPoint,
                strength = pokemon.strength,
                defense = pokemon.defense,
                speed = pokemon.speed,
                unlockedXp = pokemon.unlockedXp,
                skills = skills.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    damage = s.Damage,
                    powerPoints = s.PowerPoints,
                    accuracy = s.Accuracy,
                    type = s.TypeChart?.typeName ?? "normal"
                }).ToList(),
                evolveTo = pokemon.evolveTo
            };

            return Ok(enrichedPokemon);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur GetPokemonById: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la récupération du Pokémon" });
        }
    }
    
    /// <summary>
    /// This method retrieves all Pokémon with basic info.
    /// </summary>
    [HttpGet("getAllPokemon")]
    public async Task<ActionResult<List<object>>> GetAllPokemon()
    {
        try
        {
            var pokemons = await _ctx.Pokemons.ToListAsync();
            
            var pokemonList = pokemons.Select(p => new
            {
                id = p.Id,
                name = p.name,
                healthPoint = p.healthPoint,
                maxHealthPoint = p.maxHealthPoint,
                strength = p.strength,
                defense = p.defense,
                speed = p.speed
            }).ToList();
            
            return Ok(pokemonList);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur GetAllPokemon: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la récupération des Pokémon" });
        }
    }

    /// <summary>
    /// Get a random Pokémon for battles
    /// </summary>
    [HttpGet("getRandomPokemon")]
    public async Task<ActionResult<object>> GetRandomPokemon()
    {
        try
        {
            var pokemonCount = await _ctx.Pokemons.CountAsync();
            var random = new Random();
            var randomId = random.Next(1, pokemonCount + 1);
            
            return await GetPokemonById(randomId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur GetRandomPokemon: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la génération d'un Pokémon aléatoire" });
        }
    }

    /// <summary>
    /// Get Pokémon by type
    /// </summary>
    [HttpGet("getPokemonByType/{typeName}")]
    public async Task<ActionResult<List<object>>> GetPokemonByType(string typeName)
    {
        try
        {
            var pokemonIds = await _ctx.Database
                .SqlQuery<int>($@"
                    SELECT pt.fk_pokemon 
                    FROM pokemon_type pt 
                    INNER JOIN type t ON pt.fk_type = t.id 
                    WHERE t.typeName = {typeName}")
                .ToListAsync();

            if (!pokemonIds.Any())
            {
                return NotFound(new { error = $"Aucun Pokémon de type {typeName} trouvé." });
            }

            var pokemons = await _ctx.Pokemons
                .Where(p => pokemonIds.Contains(p.Id))
                .ToListAsync();

            var pokemonList = pokemons.Select(p => new
            {
                id = p.Id,
                name = p.name,
                healthPoint = p.healthPoint,
                maxHealthPoint = p.maxHealthPoint,
                strength = p.strength,
                defense = p.defense,
                speed = p.speed
            }).ToList();

            return Ok(pokemonList);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur GetPokemonByType: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la récupération des Pokémon par type" });
        }
    }
}