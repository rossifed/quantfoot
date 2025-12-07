using Microsoft.AspNetCore.Mvc;
using Teams.Application.Services;

namespace Teams.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;
    private readonly ILogger<TeamsController> _logger;

    public TeamsController(ITeamService teamService, ILogger<TeamsController> logger)
    {
        _teamService = teamService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTeams(CancellationToken cancellationToken)
    {
        try
        {
            var teams = await _teamService.GetAllTeamsAsync(cancellationToken);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all teams");
            return StatusCode(500, new { message = "An error occurred while retrieving teams" });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetTeamById(long id, CancellationToken cancellationToken)
    {
        try
        {
            var team = await _teamService.GetTeamByIdAsync(id, cancellationToken);
            if (team == null)
            {
                return NotFound(new { message = $"Team with id {id} not found" });
            }
            return Ok(team);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team with id {TeamId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the team" });
        }
    }

    [HttpGet("country/{country}")]
    public async Task<IActionResult> GetTeamsByCountry(string country, CancellationToken cancellationToken)
    {
        try
        {
            var teams = await _teamService.GetTeamsByCountryAsync(country, cancellationToken);
            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teams for country {Country}", country);
            return StatusCode(500, new { message = "An error occurred while retrieving teams" });
        }
    }

    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetTeamByName(string name, CancellationToken cancellationToken)
    {
        try
        {
            var team = await _teamService.GetTeamByNameAsync(name, cancellationToken);
            if (team == null)
            {
                return NotFound(new { message = $"Team with name {name} not found" });
            }
            return Ok(team);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team with name {TeamName}", name);
            return StatusCode(500, new { message = "An error occurred while retrieving the team" });
        }
    }
}
