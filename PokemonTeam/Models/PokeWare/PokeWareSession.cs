using PokemonTeam.Models;
namespace PokemonTeam.Models.PokeWare;  
using System.Collections.Generic;

/// <summary>
/// This class stores the current PokéWare quiz session in the HTTP session.
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="Pokemons"/> : Les 6 Pokémon sélectionnés</description></item>
///   <item><description><see cref="Questions"/> : Liste des questions du quiz</description></item>
///   <item><description><see cref="CurrentQuestionIndex"/> : Index de la question courante</description></item>
///   <item><description><see cref="LivesLeft"/> : Vies restantes</description></item>
///   <item><description><see cref="Score"/> : Score actuel</description></item>
///   <item><description><see cref="PokeDollarsEarned"/> : Gains en PokéDollars</description></item>
///   <item><description><see cref="IsOver"/> : Partie terminée ?</description></item>
///   <item><description><see cref="CurrentQuestion"/> : Question courante (ou null)</description></item>
/// </list>
/// </remarks>
/// <author>Elerig</author>
public class PokeWareSession
{
    public List<Pokemon> Pokemons { get; set; } = new();
    // Liste des questions générées pour ce quiz
    public List<PokeWareQuestion> Questions { get; set; } = new();

    public int CurrentQuestionIndex { get; set; }
    public int LivesLeft { get; set; } = 6;
    public int Score { get; set; }
    public int PokeDollarsEarned { get; set; }

    /// <summary>
    /// Nombre total de questions du quiz.
    /// </summary>
    public int TotalQuestions => Questions.Count;

    /// <summary>
    /// Retourne <c>true</c> lorsque le joueur n’a plus de vie
    /// ou que toutes les questions ont été posées.
    /// </summary>
    public bool IsOver => LivesLeft <= 0 || CurrentQuestionIndex >= Questions.Count;

    /// <summary>
    /// Question en cours ; <c>null</c> si l’index dépasse la liste.
    /// </summary>
    public PokeWareQuestion? CurrentQuestion =>
        (CurrentQuestionIndex >= 0 && CurrentQuestionIndex < Questions.Count)
            ? Questions[CurrentQuestionIndex]
            : null;
}
