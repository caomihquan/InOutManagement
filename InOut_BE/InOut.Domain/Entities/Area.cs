namespace InOut.Domain.Entities;
public class Area
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public Guid? ParentId { get; set; }
    public Area? Parent { get; set; }
    public string Type { get; set; } = "Room";
    public bool IsActive { get; set; } = true;
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}