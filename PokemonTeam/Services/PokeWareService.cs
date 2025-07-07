using System.Net.Http;
using System.Text.Json;

/// <summary>
/// This service generates quiz questions.
/// </summary>
/// <author>
/// Elerig
/// </author>
public class QuizService : IQuizService
{
    private readonly IPokemonService _pokemonService;
    private readonly IHttpClientFactory _httpClientFactory;

    public QuizService(IPokemonService pokemonService, IHttpClientFactory httpClientFactory)
    {
        _pokemonService = pokemonService;
        _httpClientFactory = httpClientFactory;
    }

    public List<QuizQuestion> GenerateQuiz(int count)
    {
        var questions = new List<QuizQuestion>();
        var allPokemons = _pokemonService.GetAllPokemonNames();

        for (int i = 0; i < count; i++)
        {
            if (i % 2 == 0)
            {
                questions.Add(GenerateTextQuestion(allPokemons));
            }
            else
            {
                var poke = allPokemons[new Random().Next(allPokemons.Count)];
                var q = GenerateGuessPokemonQuestionAsync(poke).Result;
                questions.Add(q);
            }
        }

        return questions;
    }

    private QuizQuestion GenerateTextQuestion(List<string> allNames)
    {
        var rnd = new Random();
        string answer = allNames[rnd.Next(allNames.Count)];

        return new QuizQuestion
        {
            QuestionText = $"Quel est le type principal de {answer} ?",
            ImageUrl = null,
            Choices = _pokemonService.GetRandomTypesIncluding(answer), // exemple : ["Feu", "Eau", "Plante", "Électrik"]
            CorrectAnswer = _pokemonService.GetMainType(answer)
        };
    }

    public async Task<QuizQuestion> GenerateGuessPokemonQuestionAsync(string pokemonName)
    {
        var client = _httpClientFactory.CreateClient();
        var response = await client.GetAsync($"https://pokeapi.co/api/v2/pokemon/{pokemonName.ToLower()}");

        if (!response.IsSuccessStatusCode)
            return new QuizQuestion
            {
                QuestionText = $"Quel est ce Pokémon ? (image indisponible)",
                Choices = _pokemonService.GetRandomPokemonNamesIncluding(pokemonName),
                CorrectAnswer = pokemonName
            };

        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var spriteUrl = json.RootElement
            .GetProperty("sprites")
            .GetProperty("front_default")
            .GetString();

        return new QuizQuestion
        {
            QuestionText = "", // visuel
            ImageUrl = spriteUrl,
            Choices = _pokemonService.GetRandomPokemonNamesIncluding(pokemonName),
            CorrectAnswer = pokemonName
        };
    }

    public bool ValidateAnswer(QuizQuestion question, string userAnswer)
    {
        return string.Equals(userAnswer, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
    }
}
