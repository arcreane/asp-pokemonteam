namespace PokemonTeam.Models.Dto;

public class PokemonDto
{
    public int Id { get; set; }
    public string name { get; set; } = string.Empty;
    public short healthPoint { get; set; }
    public short maxHealthPoint { get; set; }
    public short defense { get; set; }
    public short strength { get; set; }
    public short speed { get; set; }
    public int unlockedXp { get; set; }
    
    // pour simplifier côté front, liste des noms de skills
    public List<string> skills { get; set; } = new();

    // pour simplifier côté front, liste des types
    public List<string> types { get; set; } = new();
}