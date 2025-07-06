using Microsoft.AspNetCore.Mvc;
using PokemonTeam.Data;
using PokemonTeam.Models;
using Microsoft.EntityFrameworkCore;


using System.Security.Claims;

/// <summary>
/// This controller handles object management (shop, inventory, use).
/// </summary>
/// <remarks>
/// Attributes :
/// <list type="bullet">
///   <item><description><see cref="Index"/> : Display all available items</description></item>
///   <item><description><see cref="Buy"/> : Purchase an object</description></item>
///   <item><description><see cref="Inventory"/> : Show player's items</description></item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
public class ObjectController : Controller
{
    private readonly PokemonDbContext _context;

    public ObjectController(PokemonDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var items = await _context.Objects.ToListAsync();
        return View(items);
    }

    [HttpPost]
    public async Task<IActionResult> Buy(int objectId)
    {
        var userId = GetCurrentUserId();
        var player = await _context.Players.FirstOrDefaultAsync(p => p.FkUserAuth == userId);
        var item = await _context.Objects.FindAsync(objectId);

        if (player.Pokedollar >= item.Price)
        {
            player.Pokedollar -= item.Price;
            _context.PlayerObjects.Add(new PlayerObject { FkPlayer = player.Id, FkObject = item.Id });
            await _context.SaveChangesAsync();
            return RedirectToAction("Inventory");
        }

        ModelState.AddModelError("", "Pas assez de pokédollars.");
        return RedirectToAction("Index");
    }

    public async Task<IActionResult> Inventory()
    {
        var userId = GetCurrentUserId();
        var player = await _context.Players.FirstOrDefaultAsync(p => p.FkUserAuth == userId);
        var inventory = await _context.PlayerObjects
            .Include(po => po.Object)
            .Where(po => po.FkPlayer == player.Id)
            .ToListAsync();

        return View(inventory);
    }

    private int GetCurrentUserId()
    {
        // Extrait l'ID de l'utilisateur via Claims
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    }
}
