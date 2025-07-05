namespace PokemonTeam.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class PokeGachaController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}