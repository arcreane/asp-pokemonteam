using PokemonTeam.Models;

/// <summary>
/// Provides utility methods for accessing Pokémon data.
/// </summary>
/// <author>
/// Elerig
/// </author>
public interface IPokemonService
{
    List<string> GetAllPokemonNames();
    List<string> GetRandomPokemonNamesIncluding(string correct);
    List<string> GetRandomTypesIncluding(string pokemonName);
    string GetMainType(string pokemonName);
    List<Pokemon> GetPokemonsByIds(List<int> ids);
    List<Pokemon> GetPlayerPokemons(int playerId);
}
