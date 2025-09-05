namespace InOut.Domain.Entities;
public class VisitorPass
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VisitorId { get; set; }
    public Visitor Visitor { get; set; } = default!;
    public Guid? HostUserId { get; set; }
    public User? HostUser { get; set; }
    public DateTimeOffset ValidFrom { get; set; }
    public DateTimeOffset ValidTo { get; set; }
    public string Status { get; set; } = "Pending";
    public string Code { get; set; } = default!;
}