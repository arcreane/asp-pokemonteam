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
    
    public DbSet<Pokemon> Pokemons { get; set; }
    
    public DbSet<TypeChart> TypeChart { get; set; }
    public DbSet<Player> Players { get; set; }
    public DbSet<Item> Items { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAuthModel>().ToTable("user_auth");
        modelBuilder.Entity<Item>().ToTable("object");
        modelBuilder.Entity<Skill>().ToTable("skill");
        modelBuilder.Entity<Pokemon>().ToTable("pokemon");
        modelBuilder.Entity<TypeChart>().ToTable("type");
        modelBuilder.Entity<Player>().ToTable("player");

        modelBuilder.Entity<Player>()
            .HasOne(p => p.UserAuth)
            .WithMany()
            .HasForeignKey(p => p.fk_user_auth);

        modelBuilder.Entity<Player>()
            .HasMany(p => p.Items)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "player_object",
                j => j
                    .HasOne<Item>()
                    .WithMany()
                    .HasForeignKey("fk_object")
                    .HasConstraintName("FK_player_object_object"),
                j => j
                    .HasOne<Player>()
                    .WithMany()
                    .HasForeignKey("fk_player")
                    .HasConstraintName("FK_player_object_player")
            );
        
        modelBuilder.Entity<Player>()
            .HasMany(p => p.Pokemons)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "player_pokemon",
                j => j
                    .HasOne<Pokemon>()
                    .WithMany()
                    .HasForeignKey("fk_pokemon")
                    .HasConstraintName("FK_player_pokemon_pokemon"),
                j => j
                    .HasOne<Player>()
                    .WithMany()
                    .HasForeignKey("fk_player")
                    .HasConstraintName("FK_player_pokemon_player")
            );
        
        modelBuilder.Entity<Pokemon>()
            .HasMany(p => p.Types)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "pokemon_type",
                j => j
                    .HasOne<TypeChart>()
                    .WithMany()
                    .HasForeignKey("fk_type")
                    .HasConstraintName("FK_pokemon_type_type"),
                j => j
                    .HasOne<Pokemon>()
                    .WithMany()
                    .HasForeignKey("fk_pokemon")
                    .HasConstraintName("FK_pokemon_type_pokemon")
            );
    }
}
