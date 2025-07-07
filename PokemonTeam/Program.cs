using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using PokemonTeam.Models;
using PokemonTeam.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add secrets to the configuration.
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>();

builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication - CONFIGURATION FINALE CORRIGÉE
const string DEFAULT_JWT_KEY = "SuperSecretKeyForJWTTokenGeneration2025PokemonTeamApplicationVeryLongKeyForSecurity!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["access_token"];
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
                Console.WriteLine($"DEBUG Program: Token récupéré depuis cookie: {token.Substring(0, 20)}...");
            }
            else
            {
                Console.WriteLine("DEBUG Program: Aucun token trouvé dans les cookies");
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"DEBUG Program: Échec authentification JWT: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("DEBUG Program: Token JWT validé avec succès");
            return Task.CompletedTask;
        }
    };

    // CORRECTION: Utiliser exactement la même clé
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
    {
        jwtKey = DEFAULT_JWT_KEY;
    }

    Console.WriteLine($"DEBUG Program: Utilisation de la clé (longueur {jwtKey.Length}): {jwtKey.Substring(0, 20)}...");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "PokemonTeam",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "PokemonTeamUser",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero,
        
        // CORRECTION: Paramètres additionnels pour éviter les erreurs de validation
        RequireExpirationTime = true,
        RequireSignedTokens = true,
        SaveSigninToken = false,
        ValidateActor = false,
        ValidateTokenReplay = false
    };
});

builder.Services.AddAuthorization();

// Services d'application
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ITypeChartService, TypeChartService>();
builder.Services.AddScoped<IPasswordHasher<UserAuthModel>, PasswordHasher<UserAuthModel>>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<PokemonDbContext>();
    DbInitializer.Initialize(context);
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// CORRECTION: Commenté temporairement pour éviter le problème HTTPS
// app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();