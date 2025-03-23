#if false
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace PokemonTeam.Models
{
    /// <summary>
    /// This class represents an in-game object that can be owned by a player.
    /// </summary>
    /// <remarks>
    /// Attributes :
    /// <list type="bullet">
    ///   <item>
    ///     <description><see cref="Id"/> : Identifiant unique de l'objet.</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Name"/> : Nom de l'objet (unique).</description>
    ///   </item>
    ///   <item>
    ///     <description><see cref="Price"/> : Prix de l'objet en Pokédollars (>= 0).</description>
    ///   </item>
    /// </list>
    /// </remarks>
    /// <author>
    /// Elerig
    /// </author>

    public class Objet
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Price { get; set; }

        public ICollection<PlayerObject> PlayerObjects { get; set; }
    }

}
#endif