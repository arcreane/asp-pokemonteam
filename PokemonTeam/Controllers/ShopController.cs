/// <summary>
/// API controller for interacting with the Shop.
/// </summary>
/// <remarks>
/// Endpoints :
/// <list type="bullet">
///   <item>
///     <description>GET /api/shop  → renvoie la liste des objets.</description>
///   </item>
///   <item>
///     <description>POST /api/shop/purchase → tente d’acheter un objet.</description>
///   </item>
/// </list>
/// </remarks>
/// <author>
/// Elerig
/// </author>
namespace PokemonDbContext.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonDbContext.Models;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ShopController(ApplicationDbContext db) => _db = db;

    /// <summary>
    /// Retourne tous les objets du shop sous forme de JSON.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems()
        => await _db.Items.AsNoTracking().ToListAsync();

    /// <summary>
    /// Vérifie le solde du joueur puis, si possible, attribue l’objet.
    /// </summary>
    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseRequest request)
    {
        // Récupération des entités
        var player = await _db.Players.SingleOrDefaultAsync(p => p.PlayerId == request.PlayerId);
        var item = await _db.Items.SingleOrDefaultAsync(i => i.ItemId == request.ItemId);

        if (player is null || item is null)
            return NotFound("Player or Item not found.");

        if (player.PokeDollar < item.Price)
            return BadRequest("Fonds insuffisants.");

        // Transaction d’achat
        player.PokeDollar -= item.Price;
        player.Inventory.Add(item);          // Inventory = ICollection<Item>
        await _db.SaveChangesAsync();

        return Ok(new
        {
            Message = $"Achat de {item.Name} réussi !",
            NewBalance = player.PokeDollar
        });
    }

    /// <summary>
    /// Représente la charge utile JSON pour /purchase.
    /// </summary>
    public sealed record PurchaseRequest(int PlayerId, int ItemId);
}
