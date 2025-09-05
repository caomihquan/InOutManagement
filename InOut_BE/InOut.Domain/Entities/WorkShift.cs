namespace InOut.Domain.Entities;
public class WorkShift
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}