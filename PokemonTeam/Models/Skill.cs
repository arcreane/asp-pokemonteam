using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonTeam.Models
{
    /// <summary>
    /// The Skill class represents a skill.
    /// </summary>
    /// <remarks>
    /// Attributes:
    /// <list type="bullet">
    ///   <item>
    ///     <description><see cref="Id"/>: The unique identifier of the skill.</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Name"/>: The name of the skill (string).</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="TypeId"/>: The identifier of the skill type (int).</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Damage"/>: The damage inflicted (int).</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="PowerPoints"/>: The number of power points (int).</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Accuracy"/>: The accuracy of the skill (int).</description>
    ///   </item>
    /// </list>
    /// </remarks>
    /// <author>
    /// Adam
    /// </author>
    public class Skill
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; private set; } = string.Empty;

        [Required]
        public int TypeId { get; private set; }

        [Required]
        public int Damage { get; private set; }

        [Required]
        [Column("power_point")]
        public int PowerPoints { get; set; }

        [Required]
        public int Accuracy { get; private set; }

        // Constructeur sans paramètres pour EF
        protected Skill() { }

        public Skill(string name, int typeId, int damage, int powerPoints, int accuracy)
        {
            Name = name;
            TypeId = typeId;
            Damage = damage;
            PowerPoints = powerPoints;
            Accuracy = accuracy;
        }
    }
}
