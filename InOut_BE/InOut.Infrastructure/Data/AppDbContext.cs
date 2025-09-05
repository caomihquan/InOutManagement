using InOut.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InOut.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<UserCard> UserCards => Set<UserCard>();
    public DbSet<AccessLog> AccessLogs => Set<AccessLog>();
    public DbSet<WorkShift> WorkShifts => Set<WorkShift>();
    public DbSet<WorkAssignment> WorkAssignments => Set<WorkAssignment>();
    public DbSet<Visitor> Visitors => Set<Visitor>();
    public DbSet<VisitorPass> VisitorPasses => Set<VisitorPass>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e => {
            e.HasIndex(x => x.UserName).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
        });

        b.Entity<UserRole>().HasKey(x => new { x.UserId, x.RoleId });

        b.Entity<Area>()
            .HasOne(a => a.Parent)
            .WithMany()
            .HasForeignKey(a => a.ParentId);

        b.Entity<UserCard>(e => {
            e.HasIndex(x => x.CardNumber).IsUnique();
        });

        b.Entity<VisitorPass>(e => {
            e.HasIndex(x => x.Code).IsUnique();
        });

        base.OnModelCreating(b);
    }
}
