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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAuthModel>().ToTable("user_auth");
        // put here the next tables 
    }
}
