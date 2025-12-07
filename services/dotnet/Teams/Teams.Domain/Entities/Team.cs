namespace Teams.Domain.Entities;

public class Team
{
    public long Id { get; private set; }
    public string TeamName { get; private set; } = string.Empty;
    public string? TeamCode { get; private set; }
    public string? TeamCountry { get; private set; }
    public int? TeamFounded { get; private set; }
    public bool? IsNationalTeam { get; private set; }
    public string? TeamLogo { get; private set; }
    
    // Venue information
    public long? VenueId { get; private set; }
    public string? VenueName { get; private set; }
    public string? VenueAddress { get; private set; }
    public string? VenueCity { get; private set; }
    public int? VenueCapacity { get; private set; }
    public string? VenueSurface { get; private set; }

    private Team() { }

    public static Team Create(
        long id, 
        string teamName, 
        string? teamCode = null, 
        string? teamCountry = null,
        int? teamFounded = null,
        bool? isNationalTeam = null,
        string? teamLogo = null,
        long? venueId = null,
        string? venueName = null,
        string? venueAddress = null,
        string? venueCity = null,
        int? venueCapacity = null,
        string? venueSurface = null)
    {
        return new Team
        {
            Id = id,
            TeamName = teamName,
            TeamCode = teamCode,
            TeamCountry = teamCountry,
            TeamFounded = teamFounded,
            IsNationalTeam = isNationalTeam,
            TeamLogo = teamLogo,
            VenueId = venueId,
            VenueName = venueName,
            VenueAddress = venueAddress,
            VenueCity = venueCity,
            VenueCapacity = venueCapacity,
            VenueSurface = venueSurface
        };
    }
}
