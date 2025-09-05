namespace InOut.Domain.Entities;
public class UserCard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public string CardNumber { get; set; } = default!;
    public string CardType { get; set; } = "RFID";
    public bool IsActive { get; set; } = true;
    public DateTimeOffset IssuedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }
}