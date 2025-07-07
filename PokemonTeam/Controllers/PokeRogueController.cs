namespace PokemonTeam.Controllers;

using Microsoft.AspNetCore.Mvc;

[Route("[controller]")] 
public class PokeRogueController : Controller
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            return View();
        }
        
        [HttpGet("SelectTeam")]
        public IActionResult SelectTeam()
        {
            return View();
        }
        
        [HttpGet("Combat")]
        public IActionResult Combat()
        {
            return View();
        }
}