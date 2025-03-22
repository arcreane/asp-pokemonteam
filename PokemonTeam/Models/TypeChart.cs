namespace PokemonTeam.Models;

/// <summary>
/// This class represents a type chart with the following attributes :
/// </summary>
/// <remarks>
/// Attributes :
/// - Id: the unique identifier for the type chart (int)
/// - TypeName: the name of the type (string)
/// - Fire: the effectiveness against Fire type (decimal)
/// - Water: the effectiveness against Water type (decimal)
/// - Grass: the effectiveness against Grass type (decimal)
/// - Electric: the effectiveness against Electric type (decimal)
/// - Ice: the effectiveness against Ice type (decimal)
/// - Fighting: the effectiveness against Fighting type (decimal)
/// - Poison: the effectiveness against Poison type (decimal)
/// - Ground: the effectiveness against Ground type (decimal)
/// - Flying: the effectiveness against Flying type (decimal)
/// - Psychic: the effectiveness against Psychic type (decimal)
/// - Bug: the effectiveness against Bug type (decimal)
/// - Rock: the effectiveness against Rock type (decimal)
/// - Ghost: the effectiveness against Ghost type (decimal)
/// - Dragon: the effectiveness against Dragon type (decimal)
/// - Dark: the effectiveness against Dark type (decimal)
/// - Steel: the effectiveness against Steel type (decimal)
/// - Fairy: the effectiveness against Fairy type (decimal)
/// </remarks>
/// <author>
/// Mael
/// </author>
public class TypeChart
{
    
    public int id { get; set; }
    public string typeName { get; set; }
    
    public decimal fire { get; set; }
    public decimal water { get; set; }
    public decimal grass { get; set; }
    public decimal electric { get; set; }
    public decimal ice { get; set; }
    public decimal fighting { get; set; }
    public decimal poison { get; set; }
    public decimal ground { get; set; }
    public decimal flying { get; set; }
    public decimal psychic { get; set; }
    public decimal bug { get; set; }
    public decimal rock { get; set; }
    public decimal ghost { get; set; }
    public decimal dragon { get; set; }
    public decimal dark { get; set; }
    public decimal steel { get; set; }
    public decimal fairy { get; set; }
}