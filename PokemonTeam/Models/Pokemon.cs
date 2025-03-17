using PokemonTeam.Exceptions;

namespace PokemonTeam.Models;

/// <summary>
/// This class represents a Pokemon.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item>
///     <description><see cref="name"/> : Name of the pokemon. </description>
///   </item>
///   <item>
///     <description><see cref="types"/> : Type(s) of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="healthPoint"/> : Actual health points of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="maxHealthPoint"/> : Maximum health points of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="accuracy"/> : Accuracy of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="defense"/> : Defense of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="strength"/> : Strength of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="speed"/> : Speed of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="unlockedXp"/> : Player's experience needed to get this pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="skills"/> : Skills of the pokemon.</description>
///   </item>
///   <item>
///     <description><see cref="evolveTo"/> : Pokemon evolution of this pokemon. (set null if no evolution)</description>
///   </item>
/// </list>
/// </remarks>
/// <author>
/// Mohamed
/// </author>
public class Pokemon
{
    private string name { get; set; }
    private List<TypeChart> types { get; set; }
    private int healthPoint { get; set; }
    private int maxHealthPoint { get; set; }
    private int accuracy { get; set; }
    private int defense { get; set; }
    private int strength { get; set; }
    private int speed { get; set; }
    private int unlockedXp { get; set; }
    private List<Skill> skills { get; set; }
    private Pokemon evolveTo { get; set; }
    
    public Pokemon(string name, 
        List<TypeChart> types, 
        int healthPoint, 
        int maxHealthPoint, 
        int accuracy, 
        int defense, 
        int strength, 
        int speed, 
        int unlockedXp, 
        List<Skill> skills, 
        Pokemon evolveTo = null)
    {
        this.name = name;
        this.types = types;
        this.healthPoint = healthPoint;
        this.maxHealthPoint = maxHealthPoint;
        this.accuracy = accuracy;
        this.defense = defense;
        this.strength = strength;
        this.speed = speed;
        this.unlockedXp = unlockedXp;
        this.skills = skills;
        this.evolveTo = evolveTo;
    }
    
    /// <summary>
    /// Uses a skill on a target Pokémon.
    /// - Checks if the attacker has enough Power Points (PP).
    /// - Applies the type multiplier based on the target's Pokémon type(s).
    /// - Calculates damage considering the attacker's strength and the target's defense.
    /// - Ensures a minimum of 1 damage is dealt.
    /// - Reduces the target's health points accordingly.
    /// - Displays a message indicating the skill used and the damage dealt.
    /// - Throws an exception if there are not enough PP to use the skill.
    /// </summary>
    /// <param name="skill">The skill being used.</param>
    /// <param name="target">The Pokémon receiving the attack.</param>
    /// <exception cref="NotEnoughPowerPointsException">Thrown when there are no PP left for the skill.</exception>
    useSkill(Skill skill, Pokemon target)
    {
        if(skill.powerPoints > 0)
        {
            TypeChart typeChart = new TypeChart(Skill.type);

            skill.powerPoints--;

            double typeMultiplier = typeChart.multiplier(target.types);
            
            double damage = (skill.damage * (strength / target.defense)) * typeMultiplier;
            
            target.healthPoint -= (int)Math.Max(1, damage);
            
            Console.WriteLine($"{name} used {skill.name} on {target.name}: -{(int)Math.Max(1, damage)} HP!");
        }
        else
        {
            throw new NotEnoughPowerPointsException("Not enough power points to use this skill.");
        }
    }
}