namespace Fixtures.Domain.Entities;

public class Fixture
{
    public long Id { get; private set; }
    public DateTime FixtureDatetime { get; private set; }
    public DateTime FixtureDate { get; private set; }
    public long Season { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? StatusLong { get; private set; }
    public int? MinutesElapsed { get; private set; }
    
    // League info
    public int LeagueId { get; private set; }
    public string LeagueName { get; private set; } = string.Empty;
    public string? LeagueType { get; private set; }
    public string? LeagueCountry { get; private set; }
    public string? LeagueRound { get; private set; }
    
    // Venue info
    public int? VenueId { get; private set; }
    public string? VenueName { get; private set; }
    public string? VenueCity { get; private set; }
    public int? VenueCapacity { get; private set; }
    
    // Home team
    public int HomeTeamId { get; private set; }
    public string HomeTeamName { get; private set; } = string.Empty;
    public string? HomeTeamCode { get; private set; }
    public bool? HomeTeamWinner { get; private set; }
    
    // Away team
    public int AwayTeamId { get; private set; }
    public string AwayTeamName { get; private set; } = string.Empty;
    public string? AwayTeamCode { get; private set; }
    public bool? AwayTeamWinner { get; private set; }
    
    // Goals
    public int? GoalsHome { get; private set; }
    public int? GoalsAway { get; private set; }
    public int? HalftimeHome { get; private set; }
    public int? HalftimeAway { get; private set; }
    public int? FulltimeHome { get; private set; }
    public int? FulltimeAway { get; private set; }
    
    // Stats
    public string? Result { get; private set; }
    public int? GoalDifference { get; private set; }
    public int? TotalGoals { get; private set; }
    public string? Referee { get; private set; }

    private Fixture() { }

    public bool IsLive() => Status == "LIVE" || Status == "1H" || Status == "HT" || Status == "2H";
    public bool IsFinished() => Status == "FT" || Status == "AET" || Status == "PEN";
    public bool IsScheduled() => Status == "TBD" || Status == "NS";
}
