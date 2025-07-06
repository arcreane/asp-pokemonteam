using PokemonTeam.Models;

/// <summary>
/// This class represents the relationship between a player and an object.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="FkPlayer"/> : ID du joueur</description></item>
///   <item><description><see cref="FkObject"/> : ID de l'objet</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
public class PlayerObject
{
    public int FkPlayer { get; set; }
    public int FkObject { get; set; }

    public Player Player { get; set; }
    public ObjectModel Object { get; set; }
}
