using System.Numerics;
using Microsoft.EntityFrameworkCore;


namespace PokemonTeam.Models
{
     public class ArenaContext : DbContext
    {
        public ArenaContext(DbContextOptions<ArenaContext> options) : base(options) { }

        public DbSet<UserAuth> UserAuths { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Pokemon> Pokemons { get; set; }
        public DbSet<Type> Types { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Object> Objects { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<PlayerPokemon> PlayerPokemons { get; set; }
        public DbSet<PokemonSkill> PokemonSkills { get; set; }
        public DbSet<PokemonType> PokemonTypes { get; set; }
        public DbSet<PlayerObject> PlayerObjects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Définition des relations Many-to-Many
            modelBuilder.Entity<PlayerPokemon>()
                .HasKey(pp => new { pp.FkPlayer, pp.FkPokemon });

            modelBuilder.Entity<PokemonSkill>()
                .HasKey(ps => new { ps.FkPokemon, ps.FkSkill });

            modelBuilder.Entity<PokemonType>()
                .HasKey(pt => new { pt.FkPokemon, pt.FkType });

            modelBuilder.Entity<PlayerObject>()
                .HasKey(po => new { po.FkPlayer, po.FkObject });
        }
    }

}
