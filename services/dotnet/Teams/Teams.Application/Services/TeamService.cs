using Teams.Application.DTOs;
using Teams.Domain.Entities;
using Teams.Domain.Repositories;

namespace Teams.Application.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;

    public TeamService(ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<TeamResponse?> GetTeamByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        return team != null ? MapToResponse(team) : null;
    }

    public async Task<IEnumerable<TeamResponse>> GetAllTeamsAsync(CancellationToken cancellationToken = default)
    {
        var teams = await _teamRepository.GetAllAsync(cancellationToken);
        return teams.Select(MapToResponse);
    }

    public async Task<IEnumerable<TeamResponse>> GetTeamsByCountryAsync(string country, CancellationToken cancellationToken = default)
    {
        var teams = await _teamRepository.GetByCountryAsync(country, cancellationToken);
        return teams.Select(MapToResponse);
    }

    public async Task<TeamResponse?> GetTeamByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByNameAsync(name, cancellationToken);
        return team != null ? MapToResponse(team) : null;
    }

    private static TeamResponse MapToResponse(Team team)
    {
        return new TeamResponse(
            team.Id,
            team.TeamName,
            team.TeamCode,
            team.TeamCountry,
            team.TeamFounded,
            team.IsNationalTeam,
            team.TeamLogo,
            team.VenueId != null ? new VenueDto(
                team.VenueId,
                team.VenueName,
                team.VenueAddress,
                team.VenueCity,
                team.VenueCapacity,
                team.VenueSurface
            ) : null
        );
    }
}
