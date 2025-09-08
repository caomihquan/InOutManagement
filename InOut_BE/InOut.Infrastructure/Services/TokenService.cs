using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using InOut.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace InOut.Infrastructure.Services;

public class TokenService
{
    private readonly IConfiguration _config;
    public TokenService(IConfiguration config) { _config = config; }

    public string GenerateAccessToken(User user, IEnumerable<string>? roles = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? "")
        };
        if (roles != null) claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:AccessTokenMinutes"] ?? "15")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public RefreshToken CreateRefreshToken(string ipAddress, int daysValid = 30)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        var random = Convert.ToBase64String(randomBytes);
        return new RefreshToken
        {
            Token = random,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(daysValid),
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByIp = ipAddress
        };
    }
}
