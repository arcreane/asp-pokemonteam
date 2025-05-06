/// <summary>
/// This class represents an in‑game object that can be bought and owned by players.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="Id"/> : Unique identifier</description></item>
///   <item><description><see cref="Name"/> : Unique name (≤ 50 chars)</description></item>
///   <item><description><see cref="Price"/> : Cost in Pokédollars (≥ 0)</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PokemonTeam.Models
{
    [Index(nameof(Name), IsUnique = true)]
    public class Objet
    {
        [Key]
        public int ObjetId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = default!;

        [MaxLength(255)]
        public string? Description { get; set; }

        [Range(0, int.MaxValue)]
        public int Price { get; set; }
    }
}
