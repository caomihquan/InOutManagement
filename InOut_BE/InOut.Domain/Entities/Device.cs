namespace InOut.Domain.Entities;
public class Device
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string Type { get; set; } = "Door";
    public Guid AreaId { get; set; }
    public Area Area { get; set; } = default!;
    public string Status { get; set; } = "Active";
}