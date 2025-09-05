namespace InOut.Domain.Entities;
public class WorkAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public Guid WorkShiftId { get; set; }
    public WorkShift WorkShift { get; set; } = default!;
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
}