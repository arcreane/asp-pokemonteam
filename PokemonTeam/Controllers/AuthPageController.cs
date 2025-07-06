using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PokemonTeam.Controllers;

[Route("[controller]")]
[AllowAnonymous]
public class AuthPageController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}