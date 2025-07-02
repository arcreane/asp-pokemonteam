/// <summary>
/// This class represents a shop item (Objet) that a player can purchase.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="ObjetId"/> : Identifiant unique de l’objet.</description></item>
///   <item><description><see cref="Name"/> : Nom de l’objet.</description></item>
///   <item><description><see cref="Description"/> : Description courte.</description></item>
///   <item><description><see cref="Price"/> : Prix en Pokedollars.</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
namespace PokemonTeam.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Objet")]
    public class Objet
    {
        [Key]
        public int ObjetId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [Range(0, int.MaxValue)]
        public int Price { get; set; }
    }
}
