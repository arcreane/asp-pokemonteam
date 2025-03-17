namespace PokemonTeam.Models
{
    /// <summary>
    /// La classe Skill représente une compétence.
    /// </summary>
    /// <remarks>
    /// Attributs :
    /// <list type="bullet">
    ///   <item>
    ///     <description><see cref="Name"/> : le nom de la compétence (string)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Type"/> : le type de la compétence (string)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Damage"/> : les dégâts infligés (int)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="PowerPoint"/> : le nombre de points de pouvoir (int)</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Accuracy"/> : la précision de la compétence (int)</description>
    ///   </item>
    /// </list>
    /// </remarks>
    /// <author>
    /// Adam
    /// </author>
    public class Skill
    {
        private string name { get; set; }
        private string type { get; set; }
        private int damage { get; set; }
        private int powerPoints { get; set; }
        private int accuracy { get; set; }

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
