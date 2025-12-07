using Microsoft.AspNetCore.Mvc;
using Players.Application.DTOs;
using Players.Application.Services;

namespace Players.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;
    private readonly ILogger<PlayersController> _logger;

    public PlayersController(
        IPlayerService playerService,
        ILogger<PlayersController> logger)
    {
        _playerService = playerService;
        _logger = logger;
    }

    /// <summary>
    /// Get player by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PlayerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlayerResponse>> GetPlayer(long id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting player with ID {PlayerId}", id);
        
        var player = await _playerService.GetPlayerByIdAsync(id, cancellationToken);

        if (player == null)
        {
            _logger.LogWarning("Player {PlayerId} not found", id);
            return NotFound(new { message = $"Player {id} not found" });
        }

        return Ok(player);
    }

    /// <summary>
    /// Get all players (limited to 100)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PlayerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PlayerResponse>>> GetAllPlayers(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all players");
        
        var players = await _playerService.GetAllPlayersAsync(cancellationToken);
        return Ok(players);
    }

    /// <summary>
    /// Get all players for a specific team
    /// </summary>
    [HttpGet("team/{teamId}")]
    [ProducesResponseType(typeof(IEnumerable<PlayerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PlayerResponse>>> GetPlayersByTeam(
        long teamId, 
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting players for team {TeamId}", teamId);
        
        var players = await _playerService.GetPlayersByTeamIdAsync(teamId, cancellationToken);
        return Ok(players);
    }
}
