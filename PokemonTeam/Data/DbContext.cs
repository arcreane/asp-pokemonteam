using System.Numerics;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Models;

namespace PokemonTeam.Data;

/// <summary>
/// This class represents the application's database context, providing access to the database via Entity Framework.
/// </summary>
/// <remarks>
/// <list type="bullet">
///   <item>
///     <description>`UserAuths` : represents the `user_auth` table in the database.</description>
///   </item>
/// </list>
/// </remarks>
/// <author>
/// Killian
/// </author>
public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options) : base(options) { }

    public DbSet<UserAuthModel> UserAuths { get; set; }
    // put here the next tables
    public DbSet<Skill> Skills {  get; set; }
    public DbSet<Objet> Objets { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAuthModel>().ToTable("user_auth");
        modelBuilder.Entity<Skill>().ToTable("skill");
        // put here the next tables 
        modelBuilder.Entity<Objet>().ToTable("objet");
        modelBuilder.Entity<Player>().ToTable("player");
        modelBuilder.Entity<PlayerObject>().ToTable("player_object");

        // Clé composite pour l'entité associative PlayerObject
        modelBuilder.Entity<PlayerObject>()
            .HasKey(po => new { po.FkPlayer, po.FkObject });
    }
}
}
