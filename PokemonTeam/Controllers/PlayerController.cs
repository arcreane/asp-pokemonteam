using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Models;
using PokemonTeam.Models.PlayerDTO;
using Microsoft.Data.SqlClient;

namespace PokemonTeam.Controllers;

[ApiController]
[Route("api/player")]
public class PlayerController : Controller
{
    private readonly PokemonDbContext _context;

    public PlayerController(PokemonDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyPlayer([FromQuery] string game)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _context.Players
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == game);

        if (player == null) return NotFound();

        return Ok(player);
    }


    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePlayer([FromBody] CreatePlayerRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var user = await _context.UserAuths.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null) return Unauthorized();

        // Vérifier qu'il n'a pas déjà un Player pour ce jeu
        var existing = await _context.Players
            .FirstOrDefaultAsync(p => p.fk_user_auth == user.Id && p.Game == request.Game);

        if (existing != null) return Conflict("Player déjà existant pour ce jeu.");

        var newPlayer = new Player
        {
            Name = request.Name,
            Game = request.Game,
            Pokedollar = 100,
            Experience = 0,
            fk_user_auth = user.Id
        };

        _context.Players.Add(newPlayer);
        await _context.SaveChangesAsync();

        return Ok(newPlayer);
    }


    [HttpPost("update")]
    [Authorize]
    public async Task<IActionResult> UpdatePlayerProgress([FromBody] UpdatePlayerRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _context.Players
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

        if (player == null) return NotFound();

        player.Experience += request.Experience;
        player.Pokedollar += request.Pokedollar;

        await _context.SaveChangesAsync();

        return Ok(player);
    }


    [HttpDelete("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteMyPlayer([FromQuery] string game)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _context.Players
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == game);

        if (player == null) return NotFound();

        _context.Players.Remove(player);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Player for game {game} deleted" });
    }
    
    [HttpGet("my-items")]
    [Authorize]
    public async Task<IActionResult> GetMyItems([FromQuery] string game)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _context.Players
            .Include(p => p.Items)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == game);

        if (player == null) return NotFound();

        return Ok(player.Items);
    }

    [HttpPost("use-item")]
    [Authorize]
    public async Task<IActionResult> UseItem([FromBody] UseItemRequest request)
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var player = await _context.Players
            .Include(p => p.Items)
            .Include(p => p.UserAuth)
            .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

        if (player == null) return NotFound();

        var item = player.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null) return BadRequest("Item non possédé.");

        // Retire l'item
        player.Items.Remove(item);

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Item '{item.Name}' utilisé et retiré de l'inventaire." });
    }


    /// <summary>
    /// Get player's main Pokémon for combat
    /// </summary>
    [HttpGet("my-pokemon")]
    [Authorize]
    public async Task<IActionResult> GetMyPokemon([FromQuery] string game)
    {
        try
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var player = await _context.Players
                .Include(p => p.UserAuth)
                .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == game);

            if (player == null) return NotFound(new { error = "Joueur non trouvé" });

            // Pour l'instant, retourner Pikachu par défaut
            // TODO: Implémenter un système de Pokémon possédés par le joueur
            var pikachu = await _context.Database
                .SqlQuery<Pokemon>($"SELECT * FROM pokemon WHERE id = 25")
                .FirstOrDefaultAsync();

            if (pikachu == null)
            {
                return NotFound(new { error = "Pokémon par défaut non trouvé" });
            }

            // Récupérer les types
            var pokemonTypes = await _context.Database
                .SqlQuery<string>($@"
                    SELECT t.typeName 
                    FROM pokemon_type pt 
                    INNER JOIN type t ON pt.fk_type = t.id 
                    WHERE pt.fk_pokemon = 25")
                .ToListAsync();

            // Récupérer les skills
            var pokemonSkills = await _context.Database
                .SqlQuery<int>($@"
                    SELECT ps.fk_skill 
                    FROM pokemon_skill ps 
                    WHERE ps.fk_pokemon = 25")
                .ToListAsync();

            var skills = await _context.Skills
                .Include(s => s.TypeChart)
                .Where(s => pokemonSkills.Contains(s.Id))
                .ToListAsync();

            var result = new
            {
                id = pikachu.Id,
                name = pikachu.name,
                types = pokemonTypes,
                healthPoint = pikachu.healthPoint,
                maxHealthPoint = pikachu.maxHealthPoint,
                strength = pikachu.strength,
                defense = pikachu.defense,
                speed = pikachu.speed,
                skills = skills.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    damage = s.Damage,
                    powerPoints = s.PowerPoints,
                    accuracy = s.Accuracy,
                    type = s.TypeChart?.typeName ?? "normal"
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur GetMyPokemon: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la récupération du Pokémon" });
        }
    }

    // === À AJOUTER DANS PlayerController.cs ===


    /// <summary>
    /// Update player's Pokemon stats after battle
    /// </summary>
    [HttpPost("update-pokemon")]
    [Authorize]
    public async Task<IActionResult> UpdatePokemonStats([FromBody] UpdatePokemonRequest request)
    {
        try
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var player = await _context.Players
                .Include(p => p.UserAuth)
                .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

            if (player == null) return NotFound(new { error = "Joueur non trouvé" });

            // CORRECTION: Utiliser une requête SQL directe pour modifier les stats
            // car les propriétés sont en private set
            var statIncrease = Math.Max(1, request.XpGained / 10);
            
            var sql = @"
                UPDATE pokemon 
                SET 
                    health_point = CASE WHEN health_point + @hpIncrease > 200 THEN 200 ELSE health_point + @hpIncrease END,
                    max_health_point = CASE WHEN max_health_point + @hpIncrease > 200 THEN 200 ELSE max_health_point + @hpIncrease END,
                    strength = CASE WHEN strength + @strIncrease > 120 THEN 120 ELSE strength + @strIncrease END,
                    defense = CASE WHEN defense + @defIncrease > 100 THEN 100 ELSE defense + @defIncrease END,
                    speed = CASE WHEN speed + @spdIncrease > 150 THEN 150 ELSE speed + @spdIncrease END
                WHERE id = 25";

            await _context.Database.ExecuteSqlRawAsync(sql, 
                new Microsoft.Data.SqlClient.SqlParameter("@hpIncrease", statIncrease),
                new Microsoft.Data.SqlClient.SqlParameter("@strIncrease", statIncrease / 2),
                new Microsoft.Data.SqlClient.SqlParameter("@defIncrease", statIncrease / 3),
                new Microsoft.Data.SqlClient.SqlParameter("@spdIncrease", statIncrease / 2));

            // Récupérer les nouvelles stats
            var updatedPokemon = await _context.Pokemons.FindAsync(25);
            
            if (updatedPokemon == null) 
                return NotFound(new { error = "Pokémon non trouvé après mise à jour" });

            return Ok(new { 
                message = "Pokémon amélioré !",
                newStats = new {
                    hp = updatedPokemon.healthPoint,
                    maxHp = updatedPokemon.maxHealthPoint,
                    strength = updatedPokemon.strength,
                    defense = updatedPokemon.defense,
                    speed = updatedPokemon.speed
                },
                improvements = new {
                    hp = statIncrease,
                    strength = statIncrease / 2,
                    defense = statIncrease / 3,
                    speed = statIncrease / 2
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur UpdatePokemonStats: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la mise à jour" });
        }
    }

    /// <summary>
    /// Heal player's Pokemon
    /// </summary>
    [HttpPost("heal-pokemon")]
    [Authorize]
    public async Task<IActionResult> HealPokemon([FromBody] HealPokemonRequest request)
    {
        try
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var player = await _context.Players
                .Include(p => p.UserAuth)
                .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

            if (player == null) return NotFound(new { error = "Joueur non trouvé" });

            // CORRECTION: Utiliser une requête SQL pour modifier les HP
            var sql = "UPDATE pokemon SET health_point = max_health_point WHERE id = 25";
            await _context.Database.ExecuteSqlRawAsync(sql);

            // Récupérer les nouvelles stats
            var healedPokemon = await _context.Pokemons.FindAsync(25);
            
            return Ok(new { 
                message = "Pokémon soigné !",
                newHP = healedPokemon?.healthPoint ?? 0
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur HealPokemon: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors du soin" });
        }
    }

    /// <summary>
    /// Capture a new Pokemon
    /// </summary>
    [HttpPost("capture-pokemon")]
    [Authorize]
    public async Task<IActionResult> CapturePokemon([FromBody] CapturePokemonRequest request)
    {
        try
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var player = await _context.Players
                .Include(p => p.UserAuth)
                .FirstOrDefaultAsync(p => p.UserAuth.Email == email && p.Game == request.Game);

            if (player == null) return NotFound(new { error = "Joueur non trouvé" });

            // Vérifier si le joueur a assez d'argent (coût de capture)
            var captureeCost = 100;
            if (player.Pokedollar < captureeCost)
            {
                return BadRequest(new { error = "Pas assez de Pokédollars pour capturer !" });
            }

            // Chance de capture basée sur le niveau
            var captureChance = Math.Max(0.3, Math.Min(0.9, (double)player.Experience / 1000));
            var random = new Random();
            
            if (random.NextDouble() > captureChance)
            {
                return Ok(new { 
                    success = false, 
                    message = "Échec de la capture ! Le Pokémon s'est échappé.",
                    chanceUsed = Math.Round(captureChance * 100, 1)
                });
            }

            // Succès de capture
            player.Pokedollar -= captureeCost;
            player.Experience += 25; // Bonus XP pour capture

            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true,
                message = $"Pokémon capturé avec succès ! (Coût: {captureeCost} Pokédollars)",
                newBalance = player.Pokedollar,
                bonusXp = 25,
                chanceUsed = Math.Round(captureChance * 100, 1)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur CapturePokemon: {ex.Message}");
            return StatusCode(500, new { error = "Erreur lors de la capture" });
        }
    }

    // === MODÈLES DE REQUÊTES ===

    public class UpdatePokemonRequest
    {
        public string Game { get; set; } = string.Empty;
        public int XpGained { get; set; }
    }

    public class HealPokemonRequest
    {
        public string Game { get; set; } = string.Empty;
    }

    public class CapturePokemonRequest
    {
        public string Game { get; set; } = string.Empty;
        public int PokemonId { get; set; }
    }

        public class UseItemRequest
        {
            public int ItemId { get; set; }
            public string Game { get; set; } = string.Empty;
        }

    }
