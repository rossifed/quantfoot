using Teams.Application.DTOs;

namespace Teams.Application.Services;

public interface ITeamService
{
    Task<TeamResponse?> GetTeamByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<TeamResponse>> GetAllTeamsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TeamResponse>> GetTeamsByCountryAsync(string country, CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetTeamByNameAsync(string name, CancellationToken cancellationToken = default);
}
