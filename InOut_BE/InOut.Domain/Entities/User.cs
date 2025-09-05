namespace InOut.Domain.Entities;
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserCard> Cards { get; set; } = new List<UserCard>();
}