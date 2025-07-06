/// <summary>
/// This class represents a Player.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item>
///     <description><see cref="Id"/> : Identifiant unique</description>
///   </item>
///   <item>
///     <description><see cref="Name"/> : Nom du joueur</description>
///   </item>
///   <item>
///     <description><see cref="Pokedollar"/> : Monnaie possédée</description>
///   </item>
///   <item>
///     <description><see cref="Experience"/> : Expérience accumulée</description>
///   </item>
///   <item>
///     <description><see cref="FkUserAuth"/> : Référence à l'utilisateur</description>
///   </item>
///   <item>
///     <description><see cref="Game"/> : Nom du jeu ou version</description>
///   </item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
namespace PokemonTeam.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Pokedollar { get; set; } = 0;
        public int Experience { get; set; } = 0;
        public int FkUserAuth { get; set; }
        public string? Game { get; set; }

        // Navigation property
        public UserAuthModel? UserAuth { get; set; }
        public ICollection<PlayerObject> PlayerObjects { get; set; }
    }
}
