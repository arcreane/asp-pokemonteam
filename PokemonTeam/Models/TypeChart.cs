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
    
    public int id { get; private set; }
    public string typeName { get; private set; }
    
    public decimal fire { get; private set; }
    public decimal water { get; private set; }
    public decimal grass { get; private set; }
    public decimal electric { get; private set; }
    public decimal ice { get; private set; }
    public decimal fighting { get; private set; }
    public decimal poison { get; private set; }
    public decimal ground { get; private set; }
    public decimal flying { get; private set; }
    public decimal psychic { get; private set; }
    public decimal bug { get; private set; }
    public decimal rock { get; private set; }
    public decimal ghost { get; private set; }
    public decimal dragon { get; private set; }
    public decimal dark { get; private set; }
    public decimal steel { get; private set; }
    public decimal fairy { get; private set; }
}