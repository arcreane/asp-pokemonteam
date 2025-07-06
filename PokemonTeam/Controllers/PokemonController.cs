using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Exceptions;
using PokemonTeam.Models;

namespace PokemonTeam.Controllers;

/// <summary>
/// This class represents a Pokémon controller.
/// </summary>
/// <author>Mohamed</author>
/// <seealso cref="Pokemon"/>
/// <seealso cref="Skill"/>
/// <seealso cref="TypeChart"/>
/// <seealso cref="NotEnoughPowerPointsException"/>
/// <seealso cref="UseSkillResponse"/>
[ApiController]
[Route("[controller]")]
public class PokemonController : ControllerBase
{
    private readonly PokemonDbContext _ctx;

    public PokemonController(PokemonDbContext ctx) => _ctx = ctx;

    /// <summary>
    /// This method allows a Pokémon to use a skill.
    /// </summary>
    /// <param name="request"></param>
    /// <returns>Damage dealt</returns>
    /// <exception cref="NotEnoughPowerPointsException"></exception>
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

                double typeMultiplier = await TypeChart.GetDamageMultiplierAsync(_ctx, skill.Type, target.types.ToArray());
                double damage = (skill.Damage * (attacker.strength / (double)target.defense)) * typeMultiplier;
                int finalDamage = Math.Max(1, (int)damage);

                target.healthPoint -= (short)finalDamage;

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
    }
    
    [HttpPost("addPokemonToPlayer")]
    [Authorize]
    public async Task<IActionResult> AddPokemonToPlayer([FromBody] AddPokemonToPlayerRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _ctx.Players
            .Include(p => p.Pokemons)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

        if (player == null)
            return NotFound("Joueur introuvable.");

        var pokemon = await _ctx.Pokemons.FindAsync(request.PokemonId);
        if (pokemon == null)
            return NotFound("Pokémon introuvable.");

        player.Pokemons.Add(pokemon); // many-to-many relation
        await _ctx.SaveChangesAsync();

        return Ok(new { message = "Pokémon ajouté au joueur." });
    }

    public class AddPokemonToPlayerRequest
    {
        public int PokemonId { get; set; }
        public string Game { get; set; } = string.Empty;
    }


    /// <summary>
    /// This method retrieves a Pokémon by its ID.
    /// </summary>
    /// <param name="id">Pokémon ID</param>
    /// <returns>Pokémon details</returns>
    [HttpGet("getPokemonById/{id}")]
    public async Task<ActionResult<Pokemon>> GetPokemonById(int id)
    {
        var pokemon = await _ctx.Pokemons.FindAsync(id);

        if (pokemon == null)
        {
            return NotFound(new { error = "Pokémon not found." });
        }

        return Ok(pokemon);
    }

    
    /// <summary>
    /// This method retrieves all Pokémon.
    /// </summary>
    /// <returns>List of Pokémon</returns>
    [HttpGet("getAllPokemon")]
    public async Task<ActionResult<List<Pokemon>>> GetAllPokemon()
    {
        var pokemons = await _ctx.Pokemons.ToListAsync();
        return Ok(pokemons);
    }
}
