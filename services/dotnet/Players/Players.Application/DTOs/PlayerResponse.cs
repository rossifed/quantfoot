namespace Players.Application.DTOs;

public record PlayerResponse(
    long Id,
    string PlayerName,
    int? Age,
    string? Position,
    long? JerseyNumber,
    string? PhotoUrl,
    TeamDto? Team
);

public record TeamDto(
    long Id,
    string TeamName,
    string? TeamCode,
    string? TeamCountry,
    string? TeamLogo
);
