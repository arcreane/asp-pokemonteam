using PokemonTeam.Models;

/// <summary>
/// This class represents a quiz game session.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="Questions"/> : liste aléatoire</description></item>
///   <item><description><see cref="CurrentQuestionIndex"/> : suivi progression</description></item>
///   <item><description><see cref="Score"/> : points cumulés</description></item>
///   <item><description><see cref="LivesLeft"/> : 6 maximum (équivaut à 6 Pokémon)</description></item>
///   <item><description><see cref="Pokemons"/> : Pokémons choisis par le joueur</description></item>
/// </list>
/// </remarks>
/// <author>Elerig</author>
public class QuizSession
{
    public List<QuizQuestion> Questions { get; set; }
    public int CurrentQuestionIndex { get; set; } = 0;
    public int Score { get; set; } = 0;
    public int LivesLeft { get; set; } = 6;
    public List<Pokemon> Pokemons { get; set; } = new();
    public List<string> UsedItems { get; set; } = new();
    public int PokeDollarsEarned { get; set; } = 0;
}
