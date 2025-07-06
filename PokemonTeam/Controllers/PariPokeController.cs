namespace PokemonTeam.Controllers;

using Microsoft.AspNetCore.Mvc;

[Route("[controller]")]
public class PariPokeController : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        return View();
    }
}
