using Fixtures.Domain.Entities;

namespace Fixtures.Domain.Repositories;

public interface IFixtureRepository
{
    Task<Fixture?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Fixture>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Fixture>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default);
    Task<IEnumerable<Fixture>> GetByTeamIdAsync(long teamId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Fixture>> GetByStatusAsync(string status, CancellationToken cancellationToken = default);
}
