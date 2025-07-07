using Microsoft.EntityFrameworkCore;
using PokemonTeam.Models;

public class PokemonService : IPokemonService
{
    private readonly MyDbContext _context;
    private readonly Random _rnd = new();

    public PokemonService(MyDbContext context)
    {
        _context = context;
    }

    public List<string> GetAllPokemonNames()
    {
        return _context.Pokemons.Select(p => p.Name).ToList();
    }

    public List<string> GetRandomPokemonNamesIncluding(string correct)
    {
        var allNames = GetAllPokemonNames().Where(n => n != correct).ToList();
        var options = allNames.OrderBy(x => _rnd.Next()).Take(3).ToList();
        options.Add(correct);
        return options.OrderBy(x => _rnd.Next()).ToList(); // Mélange
    }

    public List<string> GetRandomTypesIncluding(string pokemonName)
    {
        var correctType = GetMainType(pokemonName);
        var allTypes = _context.Types.Select(t => t.Name).Where(t => t != correctType).ToList();

        var options = allTypes.OrderBy(x => _rnd.Next()).Take(3).ToList();
        options.Add(correctType);
        return options.OrderBy(x => _rnd.Next()).ToList();
    }

    public string GetMainType(string pokemonName)
    {
        var pokemonId = _context.Pokemons
            .Where(p => p.Name == pokemonName)
            .Select(p => p.Id)
            .FirstOrDefault();

        var typeName = _context.PokemonTypes
            .Include(pt => pt.Type)
            .Where(pt => pt.FkPokemon == pokemonId)
            .Select(pt => pt.Type.Name)
            .FirstOrDefault();

        return typeName ?? "Normal";
    }

    public List<Pokemon> GetPokemonsByIds(List<int> ids)
    {
        return _context.Pokemons.Where(p => ids.Contains(p.Id)).ToList();
    }

    public List<Pokemon> GetPlayerPokemons(int playerId)
    {
        return _context.PlayerPokemons
            .Include(pp => pp.Pokemon)
            .Where(pp => pp.FkPlayer == playerId)
            .Select(pp => pp.Pokemon)
            .ToList();
    }
}
