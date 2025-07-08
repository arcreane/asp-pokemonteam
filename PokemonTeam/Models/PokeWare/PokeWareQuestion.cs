namespace PokemonTeam.Models.PokeWare;
/// <summary>
/// This class represents a quiz question (text or image).
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="QuestionText"/> : contenu texte</description></item>
///   <item><description><see cref="ImageUrl"/> : chemin image si visuel</description></item>
///   <item><description><see cref="Choices"/> : options proposées</description></item>
///   <item><description><see cref="CorrectAnswer"/> : réponse correcte</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
public class PokeWareQuestion
{
    public string QuestionText { get; set; } = "";
    public string? ImageUrl { get; set; } // null si question textuelle
    public List<string> Choices { get; set; } = new();
    public string CorrectAnswer { get; set; } = "";
}
