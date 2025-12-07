using Players.Application.DTOs;
using Players.Domain.Entities;
using Players.Domain.Repositories;

namespace Players.Application.Services;

public class PlayerService : IPlayerService
{
    private readonly IPlayerRepository _playerRepository;

    public PlayerService(IPlayerRepository playerRepository)
    {
        _playerRepository = playerRepository;
    }

    public async Task<PlayerResponse?> GetPlayerByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var player = await _playerRepository.GetByIdAsync(id);
        return player != null ? MapToResponse(player) : null;
    }

    public async Task<IEnumerable<PlayerResponse>> GetAllPlayersAsync(CancellationToken cancellationToken = default)
    {
        var players = await _playerRepository.GetAllAsync();
        return players.Select(MapToResponse);
    }

    public async Task<IEnumerable<PlayerResponse>> GetPlayersByTeamIdAsync(long teamId, CancellationToken cancellationToken = default)
    {
        var players = await _playerRepository.GetByTeamIdAsync(teamId);
        return players.Select(MapToResponse);
    }

    private static PlayerResponse MapToResponse(Player player)
    {
        return new PlayerResponse(
            player.Id,
            player.PlayerName,
            player.Age,
            player.Position,
            player.JerseyNumber,
            player.PhotoUrl,
            player.Team != null ? new TeamDto(
                player.Team.Id,
                player.Team.TeamName,
                player.Team.TeamCode,
                player.Team.TeamCountry,
                player.Team.TeamLogo
            ) : null
        );
    }
}
