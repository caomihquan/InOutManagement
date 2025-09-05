namespace InOut.Domain.Entities;
public class AccessLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public Guid? CardId { get; set; }
    public UserCard? Card { get; set; }
    public Guid DeviceId { get; set; }
    public Device Device { get; set; } = default!;
    public Guid? AreaId { get; set; }
    public Area? Area { get; set; }
    public DateTimeOffset EventTime { get; set; } = DateTimeOffset.UtcNow;
    public string Direction { get; set; } = "IN";   // IN/OUT
    public string Result { get; set; } = "ALLOW";   // ALLOW/DENY
    public string? Reason { get; set; }
}