using Players.Domain.Entities;

namespace Players.Domain.Repositories;

public interface IPlayerRepository
{
    Task<Player?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Player>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Player>> GetByTeamIdAsync(long teamId, CancellationToken cancellationToken = default);
}
