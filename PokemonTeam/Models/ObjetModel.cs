using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace PokemonTeam.Models
{
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
