using Microsoft.EntityFrameworkCore;
using Fixtures.Domain.Entities;

namespace Fixtures.Infrastructure.Persistence;

public class FixturesDbContext : DbContext
{
    public FixturesDbContext(DbContextOptions<FixturesDbContext> options) : base(options)
    {
    }

    public DbSet<Fixture> Fixtures => Set<Fixture>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Fixture>(entity =>
        {
            entity.ToTable("fixtures", "marts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("fixture_id");
            entity.Property(e => e.FixtureDatetime).HasColumnName("fixture_datetime");
            entity.Property(e => e.FixtureDate).HasColumnName("fixture_date");
            entity.Property(e => e.Season).HasColumnName("season");
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.StatusLong).HasColumnName("status_long");
            entity.Property(e => e.MinutesElapsed).HasColumnName("minutes_elapsed");
            
            entity.Property(e => e.LeagueId).HasColumnName("league_id");
            entity.Property(e => e.LeagueName).HasColumnName("league_name").IsRequired();
            entity.Property(e => e.LeagueType).HasColumnName("league_type");
            entity.Property(e => e.LeagueCountry).HasColumnName("league_country");
            entity.Property(e => e.LeagueRound).HasColumnName("league_round");
            
            entity.Property(e => e.VenueId).HasColumnName("venue_id");
            entity.Property(e => e.VenueName).HasColumnName("venue_name");
            entity.Property(e => e.VenueCity).HasColumnName("venue_city");
            entity.Property(e => e.VenueCapacity).HasColumnName("venue_capacity");
            
            entity.Property(e => e.HomeTeamId).HasColumnName("home_team_id");
            entity.Property(e => e.HomeTeamName).HasColumnName("home_team_name").IsRequired();
            entity.Property(e => e.HomeTeamCode).HasColumnName("home_team_code");
            entity.Property(e => e.HomeTeamWinner).HasColumnName("home_team_winner");
            
            entity.Property(e => e.AwayTeamId).HasColumnName("away_team_id");
            entity.Property(e => e.AwayTeamName).HasColumnName("away_team_name").IsRequired();
            entity.Property(e => e.AwayTeamCode).HasColumnName("away_team_code");
            entity.Property(e => e.AwayTeamWinner).HasColumnName("away_team_winner");
            
            entity.Property(e => e.GoalsHome).HasColumnName("goals_home");
            entity.Property(e => e.GoalsAway).HasColumnName("goals_away");
            entity.Property(e => e.HalftimeHome).HasColumnName("halftime_home");
            entity.Property(e => e.HalftimeAway).HasColumnName("halftime_away");
            entity.Property(e => e.FulltimeHome).HasColumnName("fulltime_home");
            entity.Property(e => e.FulltimeAway).HasColumnName("fulltime_away");
            
            entity.Property(e => e.Result).HasColumnName("result");
            entity.Property(e => e.GoalDifference).HasColumnName("goal_difference");
            entity.Property(e => e.TotalGoals).HasColumnName("total_goals");
            entity.Property(e => e.Referee).HasColumnName("referee");

            entity.HasIndex(e => e.FixtureDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.HomeTeamId);
            entity.HasIndex(e => e.AwayTeamId);
        });
    }
}
