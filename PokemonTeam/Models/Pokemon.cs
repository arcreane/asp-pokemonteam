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
    
    
}