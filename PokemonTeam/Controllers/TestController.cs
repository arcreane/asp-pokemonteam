using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace PokemonTeam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IConfiguration _configuration;
    
    public TestController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    [HttpGet("token-info")]
    public IActionResult GetTokenInfo()
    {
        var token = Request.Cookies["access_token"];
        
        if (string.IsNullOrEmpty(token))
        {
            return Ok(new { message = "Aucun token trouvé", hasToken = false });
        }
        
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
            return Ok(new 
            { 
                message = "Token trouvé et lisible",
                hasToken = true,
                issuer = jsonToken.Issuer,
                audience = jsonToken.Audiences.FirstOrDefault(),
                expires = jsonToken.ValidTo,
                claims = jsonToken.Claims.Select(c => new { c.Type, c.Value }).ToArray()
            });
        }
        catch (Exception ex)
        {
            return Ok(new 
            { 
                message = "Token trouvé mais illisible",
                hasToken = true,
                error = ex.Message,
                tokenStart = token.Substring(0, Math.Min(20, token.Length))
            });
        }
    }
    
    [HttpGet("auth-test")]
    [Authorize]
    public IActionResult AuthTest()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        
        return Ok(new 
        { 
            message = "Authentification réussie !",
            userId = userId,
            email = email,
            allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToArray()
        });
    }
}