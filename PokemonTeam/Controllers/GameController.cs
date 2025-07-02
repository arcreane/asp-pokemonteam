using Microsoft.AspNetCore.Mvc;

/// <summary>
/// This controller manages the Suika-like Pokemon game.
/// </summary>
/// <remarks>
/// Handles game logic, initial state, and view rendering.
/// </remarks>
/// <author>
/// Elerig
/// </author>
public class GameController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
