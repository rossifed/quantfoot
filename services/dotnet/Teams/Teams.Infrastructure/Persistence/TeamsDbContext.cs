using Microsoft.EntityFrameworkCore;
using Teams.Domain.Entities;

namespace Teams.Infrastructure.Persistence;

public class TeamsDbContext : DbContext
{
    public TeamsDbContext(DbContextOptions<TeamsDbContext> options) : base(options)
    {
    }

    public DbSet<Team> Teams => Set<Team>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Team>(entity =>
        {
            entity.ToTable("teams", "marts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("team_id");
            entity.Property(e => e.TeamName).HasColumnName("team_name").IsRequired();
            entity.Property(e => e.TeamCode).HasColumnName("team_code");
            entity.Property(e => e.TeamCountry).HasColumnName("team_country");
            entity.Property(e => e.TeamFounded).HasColumnName("team_founded");
            entity.Property(e => e.IsNationalTeam).HasColumnName("is_national_team");
            entity.Property(e => e.TeamLogo).HasColumnName("team_logo");
            entity.Property(e => e.VenueId).HasColumnName("venue_id");
            entity.Property(e => e.VenueName).HasColumnName("venue_name");
            entity.Property(e => e.VenueAddress).HasColumnName("venue_address");
            entity.Property(e => e.VenueCity).HasColumnName("venue_city");
            entity.Property(e => e.VenueCapacity).HasColumnName("venue_capacity");
            entity.Property(e => e.VenueSurface).HasColumnName("venue_surface");

            entity.HasIndex(e => e.TeamName);
            entity.HasIndex(e => e.TeamCountry);
        });
    }
}
