using InOut.Domain.Entities;
using InOut.Infrastructure;
using InOut.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<TokenService>();

// Jwt config
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "InOut API", Version = "v1" });
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();

string GetIp(HttpContext ctx) => ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";

// --- AUTH Endpoints ---
app.MapPost("/api/auth/login", async (LoginDto dto, AppDbContext db, TokenService tokenService, HttpContext http) =>
{
    var user = await db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserName == dto.UserName);
    if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        return Results.Unauthorized();

    var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
    var accessToken = tokenService.GenerateAccessToken(user, roles);

    var refreshToken = tokenService.CreateRefreshToken(GetIp(http), daysValid: int.Parse(builder.Configuration["Jwt:RefreshTokenDays"] ?? "30"));
    refreshToken.UserId = user.Id;
    db.RefreshTokens.Add(refreshToken);
    await db.SaveChangesAsync();

    http.Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
    {
        HttpOnly = true,
        Expires = refreshToken.ExpiresAt.UtcDateTime,
        SameSite = SameSiteMode.Strict,
        Secure = app.Environment.IsProduction()
    });

    return Results.Ok(new { accessToken, user = new { user.Id, user.UserName, user.Email, roles } });
});

app.MapPost("/api/auth/refresh", async (AppDbContext db, TokenService tokenService, HttpContext http) =>
{
    if (!http.Request.Cookies.TryGetValue("refreshToken", out var token)) return Results.Unauthorized();
    var rt = await db.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == token);
    if (rt is null || !rt.IsActive) return Results.Unauthorized();

    // rotate
    rt.Revoked = true; rt.RevokedAt = DateTimeOffset.UtcNow; rt.RevokedByIp = GetIp(http);
    var newRt = tokenService.CreateRefreshToken(GetIp(http), daysValid: int.Parse(builder.Configuration["Jwt:RefreshTokenDays"] ?? "30"));
    newRt.UserId = rt.UserId; rt.ReplacedByToken = newRt.Token;
    db.RefreshTokens.Add(newRt);
    await db.SaveChangesAsync();

    var roles = (await db.UserRoles.Include(ur => ur.Role).Where(ur => ur.UserId == rt.UserId).ToListAsync()).Select(x => x.Role.Name);
    var accessToken = tokenService.GenerateAccessToken(rt.User, roles);

    http.Response.Cookies.Append("refreshToken", newRt.Token, new CookieOptions
    {
        HttpOnly = true,
        Expires = newRt.ExpiresAt.UtcDateTime,
        SameSite = SameSiteMode.Strict,
        Secure = app.Environment.IsProduction()
    });

    return Results.Ok(new { accessToken });
});

app.MapPost("/api/auth/logout", async (AppDbContext db, HttpContext http) =>
{
    if (!http.Request.Cookies.TryGetValue("refreshToken", out var token)) { http.Response.Cookies.Delete("refreshToken"); return Results.NoContent(); }
    var rt = await db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
    if (rt != null) { rt.Revoked = true; rt.RevokedAt = DateTimeOffset.UtcNow; rt.RevokedByIp = GetIp(http); await db.SaveChangesAsync(); }
    http.Response.Cookies.Delete("refreshToken");
    return Results.NoContent();
});

app.MapGet("/api/auth/me", async (ClaimsPrincipal userPrincipal, AppDbContext db) =>
{
    var sub = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? userPrincipal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
    if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var uid)) return Results.Unauthorized();
    var user = await db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == uid);
    if (user == null) return Results.NotFound();
    var roles = user.UserRoles.Select(x => x.Role.Name).ToArray();
    return Results.Ok(new { user.Id, user.UserName, user.Email, roles });
}).RequireAuthorization();

// --- Roles endpoints ---
app.MapGet("/api/roles", async (AppDbContext db) =>
    await db.Roles.Select(r => new { r.Id, r.Name }).ToListAsync()
).RequireAuthorization();

app.MapPost("/api/roles", async (Role r, AppDbContext db) => { db.Roles.Add(r); await db.SaveChangesAsync(); return Results.Created($"/api/roles/{r.Id}", r); }).RequireAuthorization();

// --- Users CRUD & role assign ---
app.MapGet("/api/users", async (AppDbContext db) =>
    await db.Users.Select(u => new { u.Id, u.UserName, u.Email, u.IsActive }).ToListAsync()
).RequireAuthorization();

app.MapGet("/api/users/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var u = await db.Users.Include(x => x.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(x => x.Id == id);
    if (u is null) return Results.NotFound();
    return Results.Ok(new { u.Id, u.UserName, u.Email, u.IsActive, roles = u.UserRoles.Select(r => r.Role.Name) });
}).RequireAuthorization();

app.MapPost("/api/users", async (UserCreateDto dto, AppDbContext db) =>
{
    if (await db.Users.AnyAsync(x => x.UserName == dto.UserName || x.Email == dto.Email)) return Results.BadRequest("UserName/Email exists");
    var u = new User { UserName = dto.UserName, Email = dto.Email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) };
    db.Users.Add(u); await db.SaveChangesAsync();
    return Results.Created($"/api/users/{u.Id}", new { u.Id, u.UserName, u.Email });
}).RequireAuthorization();

app.MapPut("/api/users/{id:guid}", async (Guid id, UserUpdateDto dto, AppDbContext db) =>
{
    var u = await db.Users.FindAsync(id); if (u == null) return Results.NotFound();
    u.UserName = dto.UserName ?? u.UserName; u.Email = dto.Email ?? u.Email; if (!string.IsNullOrEmpty(dto.Password)) u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
    u.IsActive = dto.IsActive ?? u.IsActive;
    await db.SaveChangesAsync(); return Results.NoContent();
}).RequireAuthorization();

app.MapPut("/api/users/{id:guid}/roles", async (Guid id, string[] roles, AppDbContext db) =>
{
    var user = await db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id); if (user == null) return Results.NotFound();
    db.UserRoles.RemoveRange(user.UserRoles);
    var selected = await db.Roles.Where(r => roles.Contains(r.Name)).ToListAsync();
    foreach (var r in selected) db.UserRoles.Add(new UserRole { UserId = id, RoleId = r.Id });
    await db.SaveChangesAsync(); return Results.NoContent();
}).RequireAuthorization();

// --- Areas ---
app.MapGet("/api/areas", async (AppDbContext db) => await db.Areas.Select(a => new { a.Id, a.Name, a.ParentId, a.Type, a.IsActive }).ToListAsync()).RequireAuthorization();
app.MapPost("/api/areas", async (Area a, AppDbContext db) => { db.Areas.Add(a); await db.SaveChangesAsync(); return Results.Created($"/api/areas/{a.Id}", a); }).RequireAuthorization();
app.MapPut("/api/areas/{id:guid}", async (Guid id, Area dto, AppDbContext db) =>
{
    var a = await db.Areas.FindAsync(id); if (a == null) return Results.NotFound();
    a.Name = dto.Name; a.Type = dto.Type; a.ParentId = dto.ParentId; a.IsActive = dto.IsActive; await db.SaveChangesAsync(); return Results.NoContent();
}).RequireAuthorization();

// --- Devices ---
app.MapGet("/api/devices", async (AppDbContext db) => await db.Devices.Select(d => new { d.Id, d.Name, d.Type, d.AreaId, d.Status }).ToListAsync()).RequireAuthorization();
app.MapPost("/api/devices", async (Device d, AppDbContext db) => { db.Devices.Add(d); await db.SaveChangesAsync(); return Results.Created($"/api/devices/{d.Id}", d); }).RequireAuthorization();
app.MapPut("/api/devices/{id:guid}", async (Guid id, Device dto, AppDbContext db) =>
{
    var d = await db.Devices.FindAsync(id); if (d == null) return Results.NotFound();
    d.Name = dto.Name; d.Type = dto.Type; d.AreaId = dto.AreaId; d.Status = dto.Status; await db.SaveChangesAsync(); return Results.NoContent();
}).RequireAuthorization();

// --- Access logs ---
app.MapPost("/api/access-logs", async (AccessLogDto dto, AppDbContext db) =>
{
    var log = new AccessLog { UserId = dto.UserId, CardId = dto.CardId, DeviceId = dto.DeviceId, AreaId = dto.AreaId, Direction = dto.Direction, Result = dto.Result, Reason = dto.Reason, EventTime = DateTimeOffset.UtcNow };
    db.AccessLogs.Add(log); await db.SaveChangesAsync(); return Results.Created($"/api/access-logs/{log.Id}", log);
}).RequireAuthorization();

app.MapGet("/api/access-logs", async (AppDbContext db, Guid? userId, DateTimeOffset? from, DateTimeOffset? to) =>
{
    var q = db.AccessLogs.AsQueryable();
    if (userId.HasValue) q = q.Where(x => x.UserId == userId);
    if (from.HasValue) q = q.Where(x => x.EventTime >= from);
    if (to.HasValue) q = q.Where(x => x.EventTime <= to);
    return Results.Ok(await q.OrderByDescending(x => x.EventTime).Select(x => new { x.Id, x.UserId, x.DeviceId, x.AreaId, x.EventTime, x.Direction, x.Result, x.Reason }).ToListAsync());
}).RequireAuthorization();

// Health
app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.Run();

// DTOs
public record LoginDto(string UserName, string Password);
public record UserCreateDto(string UserName, string Email, string Password);
public record UserUpdateDto(string? UserName, string? Email, string? Password, bool? IsActive);
public record AccessLogDto(Guid UserId, Guid? CardId, Guid DeviceId, Guid? AreaId, string Direction, string Result, string? Reason);
