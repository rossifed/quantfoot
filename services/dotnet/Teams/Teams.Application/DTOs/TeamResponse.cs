namespace Teams.Application.DTOs;

public record TeamResponse(
    long Id,
    string TeamName,
    string? TeamCode,
    string? TeamCountry,
    int? TeamFounded,
    bool? IsNationalTeam,
    string? TeamLogo,
    VenueDto? Venue
);

public record VenueDto(
    long? VenueId,
    string? VenueName,
    string? VenueAddress,
    string? VenueCity,
    int? VenueCapacity,
    string? VenueSurface
);
