using Microsoft.AspNetCore.Mvc;
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
                // Reduction of power points
                skill.PowerPoints--;

                // Calculating the type multiplier
                double typeMultiplier = await TypeChart.GetDamageMultiplierAsync(_ctx,skill.Type, target.types.ToArray());

                // Calculating the damage
                double damage = (skill.Damage * (attacker.strength / (double)target.defense)) * typeMultiplier;
                int finalDamage = Math.Max(1, (int)damage);

                // Application of the damage
                target.healthPoint -= finalDamage;

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
}
