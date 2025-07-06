using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Exceptions;
using PokemonTeam.Models;
using PokemonTeam.Services;

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
            var battleService = new BattleService(_ctx);
            var response = await battleService.UseSkill(request.Skill, request.Attacker, request.Target);
            return Ok(response);
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
