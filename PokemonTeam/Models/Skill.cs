namespace PokemonTeam.Models
{
    /// <summary>
    /// The Skill class represents a skill.
    /// </summary>
    /// <remarks>
    /// Attributes:
    /// <list type="bullet">
    ///   <item>
    ///     <description><see cref="Name"/>: the name of the skill (string)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Type"/>: the type of the skill (string)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Damage"/>: the damage inflicted (int)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="PowerPoint"/>: the number of power points (int)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Accuracy"/>: the accuracy of the skill (int)</description>
    ///   </item>
    /// </list>
    /// </remarks>
    /// <author>
    /// Adam
    /// </author>

    public class Skill
    {
        public string name { get; private set; }
        public string type { get; private set; }
        public int damage { get; private set; }
        public int powerPoints { get; set; }
        public int accuracy { get; private set; }

        public Skill(string name, string type, int damage, int powerPoints, int accuracy)
        {
            this.name = name;
            this.type = type;
            this.damage = damage;
            this.powerPoints = powerPoints;
            this.accuracy = accuracy;
        }
    }
}
