using Microsoft.AspNetCore.Mvc;

/// <summary>
/// This controller manages the quiz game logic.
/// </summary>
/// <remarks>
/// Actions :
/// <list type="bullet">
///   <item><description>Selection de l’équipe Pokémon</description></item>
///   <item><description>Choix du mode de jeu</description></item>
///   <item><description>Enchaînement des questions</description></item>
///   <item><description>Utilisation d’objets</description></item>
///   <item><description>Fin de partie et affichage du score</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
public class PokeWareController : Controller
{
    private readonly IPokeWareService _quizService;
    private readonly IPokemonService _pokemonService;
    private readonly IShopService _shopService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PokeWareController(IPokeWareService quizService, IPokemonService pokemonService, IShopService shopService, IHttpContextAccessor httpContextAccessor)
    {
        _quizService = quizService;
        _pokemonService = pokemonService;
        _shopService = shopService;
        _httpContextAccessor = httpContextAccessor;
    }

    // 1. Choix des 6 Pokémon
    public IActionResult SelectTeam()
    {
        var playerId = GetPlayerId();
        var pokemons = _pokemonService.GetPlayerPokemons(playerId);
        return View(pokemons);
    }

    [HttpPost]
    public IActionResult ConfirmTeam(List<int> selectedPokemonIds)
    {
        if (selectedPokemonIds.Count != 6)
        {
            TempData["Error"] = "Tu dois choisir exactement 6 Pokémon.";
            return RedirectToAction("SelectTeam");
        }

        var session = new PokeWareSession
        {
            Pokemons = _pokemonService.GetPokemonsByIds(selectedPokemonIds),
            LivesLeft = 6
        };

        HttpContext.Session.SetObject("QuizSession", session);
        return RedirectToAction("SelectMode");
    }

    // 2. Choix du mode de jeu
    public IActionResult SelectMode()
    {
        return View(); // propose 10 / 20 / 50 / Infini
    }

    [HttpPost]
    public IActionResult StartQuiz(int numberOfQuestions)
    {
        var session = HttpContext.Session.GetObject<PokeWareSession>("QuizSession");
        if (session == null) return RedirectToAction("SelectTeam");

        session.Questions = _quizService.GenerateQuiz(numberOfQuestions);
        HttpContext.Session.SetObject("QuizSession", session);

        return RedirectToAction("Question");
    }

    // 3. Affichage d’une question
    public IActionResult Question()
    {
        var session = HttpContext.Session.GetObject<PokeWareSession>("QuizSession");
        if (session == null || session.IsOver) return RedirectToAction("Result");

        return View(session.CurrentQuestion);
    }

    [HttpPost]
    public IActionResult SubmitAnswer(string userAnswer)
    {
        var session = HttpContext.Session.GetObject<PokeWareSession>("QuizSession");
        if (session == null) return RedirectToAction("SelectTeam");

        var current = session.CurrentQuestion;
        if (current == null) return RedirectToAction("Result");

        if (_quizService.ValidateAnswer(current, userAnswer))
        {
            session.Score += 10;
            session.PokeDollarsEarned += 5;
        }
        else
        {
            session.LivesLeft--;
        }

        session.CurrentQuestionIndex++;
        HttpContext.Session.SetObject("QuizSession", session);

        return RedirectToAction("Question");
    }

    // 4. Boutique d’objets
    public IActionResult Shop()
    {
        var playerId = GetPlayerId();
        var objects = _shopService.GetPlayerObjects(playerId);
        return View(objects);
    }

    [HttpPost]
    public IActionResult UseObject(int objectId)
    {
        var session = HttpContext.Session.GetObject<PokeWareSession>("QuizSession");
        var effect = _shopService.UseObject(objectId, ref session);
        HttpContext.Session.SetObject("QuizSession", session);

        TempData["Message"] = $"Objet utilisé : {effect}";
        return RedirectToAction("Question");
    }

    // 5. Résultat final
    public IActionResult Result()
    {
        var session = HttpContext.Session.GetObject<PokeWareSession>("QuizSession");
        if (session == null) return RedirectToAction("SelectTeam");

        var bonus = session.LivesLeft * 10;
        session.Score += bonus;

        ViewBag.FinalScore = session.Score;
        ViewBag.Bonus = bonus;
        ViewBag.PokeDollars = session.PokeDollarsEarned;

        return View("Result");
    }

    // 🔒 Helper pour récupérer le joueur connecté
    private int GetPlayerId()
    {
        return int.Parse(User.Claims.First(c => c.Type == "PlayerId").Value);
    }
}
