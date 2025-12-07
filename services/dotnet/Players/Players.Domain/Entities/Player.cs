namespace Players.Domain.Entities;

public class Player
{
    public long Id { get; private set; }
    public string PlayerName { get; private set; } = string.Empty;
    public int? Age { get; private set; }
    public string? Position { get; private set; }
    public long? JerseyNumber { get; private set; }
    public string? PhotoUrl { get; private set; }
    public long? TeamId { get; private set; }
    
    // Navigation property
    public Team? Team { get; private set; }

    private Player() { }

    public static Player Create(long id, string playerName, int? age, string? position, 
        long? jerseyNumber, string? photoUrl, long? teamId)
    {
        return new Player
        {
            Id = id,
            PlayerName = playerName,
            Age = age,
            Position = position,
            JerseyNumber = jerseyNumber,
            PhotoUrl = photoUrl,
            TeamId = teamId
        };
    }
}
