using Microsoft.EntityFrameworkCore;
using Players.Domain.Entities;

namespace Players.Infrastructure.Persistence;

public class PlayersDbContext : DbContext
{
    public PlayersDbContext(DbContextOptions<PlayersDbContext> options) : base(options)
    {
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Team> Teams => Set<Team>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Player entity
        modelBuilder.Entity<Player>(entity =>
        {
            entity.ToTable("players", "marts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("player_id");
            entity.Property(e => e.PlayerName).HasColumnName("player_name").IsRequired();
            entity.Property(e => e.Age).HasColumnName("age");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.JerseyNumber).HasColumnName("jersey_number");
            entity.Property(e => e.PhotoUrl).HasColumnName("photo_url");
            entity.Property(e => e.TeamId).HasColumnName("team_id");

            entity.HasOne(e => e.Team)
                .WithMany(t => t.Players)
                .HasForeignKey(e => e.TeamId);

            entity.HasIndex(e => e.PlayerName);
            entity.HasIndex(e => e.TeamId);
        });

        // Configure Team entity
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
        });
    }
}
