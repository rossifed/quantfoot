using Teams.Domain.Entities;

namespace Teams.Domain.Repositories;

public interface ITeamRepository
{
    Task<Team?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Team>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Team>> GetByCountryAsync(string country, CancellationToken cancellationToken = default);
    Task<Team?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
