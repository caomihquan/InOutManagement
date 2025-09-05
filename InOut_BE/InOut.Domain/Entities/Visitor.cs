namespace InOut.Domain.Entities;
public class Visitor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public bool IsActive { get; set; } = true;
}