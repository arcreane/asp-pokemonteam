using PokemonTeam.Models;
using Microsoft.AspNetCore.Identity;

namespace PokemonTeam.Data;

public static class DbInitializer
{
    public static void Initialize(PokemonDbContext context, IPasswordHasher<UserAuthModel> passwordHasher)
    {
        // Seed ITEMS
        if (!context.Items.Any())
        {
            var items = new Item[]
            {
                new Item { Name = "Potion", Price = 50 },
                new Item { Name = "Super Potion", Price = 100 },
                new Item { Name = "Hyper Potion", Price = 200 },
                new Item { Name = "Max Potion", Price = 500 }
            };

            context.Items.AddRange(items);
        }

        // Seed USERS
        if (!context.UserAuths.Any())
        {
            var users = new UserAuthModel[]
            {
                new UserAuthModel { Email = "test1@example.com" },
                new UserAuthModel { Email = "test2@example.com" },
                new UserAuthModel { Email = "test3@example.com" }
            };

            foreach (var user in users)
            {
                user.Password = passwordHasher.HashPassword(user, "password123");
            }

            context.UserAuths.AddRange(users);
        }

        context.SaveChanges();
    }
}