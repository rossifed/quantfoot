using Players.Application.DTOs;

namespace Players.Application.Services;

public interface IPlayerService
{
    Task<PlayerResponse?> GetPlayerByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<PlayerResponse>> GetAllPlayersAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PlayerResponse>> GetPlayersByTeamIdAsync(long teamId, CancellationToken cancellationToken = default);
}
