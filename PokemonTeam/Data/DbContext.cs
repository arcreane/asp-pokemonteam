using Microsoft.EntityFrameworkCore;
using PokemonTeam.Models;

namespace PokemonTeam.Data;

public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options) : base(options) { }

    public DbSet<UserAuthModel> UserAuths { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAuthModel>().ToTable("user");
    }
}
