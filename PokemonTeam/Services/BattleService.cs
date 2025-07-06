using PokemonTeam.Data;
using PokemonTeam.Exceptions;
using PokemonTeam.Models;

namespace PokemonTeam.Services;

public class BattleService
{
    private readonly PokemonDbContext _ctx;

    public BattleService(PokemonDbContext ctx)
    {
        _ctx = ctx;
    }

    public async Task<UseSkillResponse> UseSkill(Skill skill, Pokemon attacker, Pokemon target)
    {
        if (skill.PowerPoints <= 0)
        {
            throw new NotEnoughPowerPointsException("Not enough power points to use this skill.");
        }

        skill.PowerPoints--;

        double typeMultiplier = await TypeChart.GetDamageMultiplierAsync(
            _ctx,
            skill.Type,
            target.Types.Select(t => t.typeName).ToArray()
        );

        double damage = (skill.Damage * (attacker.strength / (double)target.defense)) * typeMultiplier;
        int finalDamage = Math.Max(1, (int)damage);

        target.healthPoint -= (short)finalDamage;

        return new UseSkillResponse(finalDamage, target);
    }
}