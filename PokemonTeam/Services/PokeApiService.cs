using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PokemonTeam.Services;

public class PokeApiService
{
    private readonly HttpClient _httpClient;
    private readonly Random _rng = new();

    public PokeApiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<(string name, string imageUrl)> GetRandomPokemonAsync()
    {
        int id = _rng.Next(1, 152); // first generation range
        var data = await _httpClient.GetFromJsonAsync<PokeApiPokemon>($"https://pokeapi.co/api/v2/pokemon/{id}");
        string image = data?.sprites?.front_default ??
                       $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png";
        return (data?.name ?? $"pokemon{id}", image);
    }

    private class PokeApiPokemon
    {
        public string name { get; set; } = "";
        public Sprite sprites { get; set; } = new();
    }

    private class Sprite
    {
        public string front_default { get; set; } = "";
    }
}
