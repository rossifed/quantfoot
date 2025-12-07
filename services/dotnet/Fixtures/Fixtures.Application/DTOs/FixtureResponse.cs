namespace Fixtures.Application.DTOs;

public record FixtureResponse(
    long Id,
    DateTime FixtureDatetime,
    DateTime FixtureDate,
    long Season,
    string Status,
    string? StatusLong,
    int? MinutesElapsed,
    LeagueDto League,
    VenueInfoDto? Venue,
    TeamInFixtureDto HomeTeam,
    TeamInFixtureDto AwayTeam,
    ScoreDto? Score,
    string? Result,
    string? Referee,
    bool IsLive,
    bool IsFinished
);

public record LeagueDto(
    int LeagueId,
    string LeagueName,
    string? LeagueType,
    string? LeagueCountry,
    string? LeagueRound
);

public record VenueInfoDto(
    int? VenueId,
    string? VenueName,
    string? VenueCity,
    int? VenueCapacity
);

public record TeamInFixtureDto(
    int TeamId,
    string TeamName,
    string? TeamCode,
    bool? IsWinner
);

public record ScoreDto(
    int? GoalsHome,
    int? GoalsAway,
    int? HalftimeHome,
    int? HalftimeAway,
    int? FulltimeHome,
    int? FulltimeAway,
    int? TotalGoals,
    int? GoalDifference
);
