using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PokemonTeam.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private const string DEFAULT_KEY = "SuperSecretKeyForJWTTokenGeneration2025PokemonTeamApplicationVeryLongKeyForSecurity!";

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(int userId, string email)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, 
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                ClaimValueTypes.Integer64)
        };

        // CORRECTION: Utiliser exactement la même clé que dans Program.cs
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
        {
            jwtKey = DEFAULT_KEY;
        }

        Console.WriteLine($"DEBUG TokenService: Utilisation de la clé (longueur {jwtKey.Length}): {jwtKey.Substring(0, 20)}...");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresMinutes = 60;
        if (int.TryParse(_configuration["Jwt:ExpiresInMinutes"], out int configExpires))
        {
            expiresMinutes = configExpires;
        }

        var expires = DateTime.UtcNow.AddMinutes(expiresMinutes);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "PokemonTeam",
            audience: _configuration["Jwt:Audience"] ?? "PokemonTeamUser",
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        Console.WriteLine($"DEBUG TokenService: Token créé, expire le {expires}");
        
        return tokenString;
    }
}