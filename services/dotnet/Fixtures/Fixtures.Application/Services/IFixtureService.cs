using Fixtures.Application.DTOs;

namespace Fixtures.Application.Services;

public interface IFixtureService
{
    Task<FixtureResponse?> GetFixtureByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<FixtureResponse>> GetAllFixturesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<FixtureResponse>> GetFixturesByDateAsync(DateTime date, CancellationToken cancellationToken = default);
    Task<IEnumerable<FixtureResponse>> GetFixturesByTeamIdAsync(long teamId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FixtureResponse>> GetLiveFixturesAsync(CancellationToken cancellationToken = default);
}
