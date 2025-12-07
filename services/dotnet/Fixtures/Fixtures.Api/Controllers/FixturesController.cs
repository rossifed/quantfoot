using Microsoft.AspNetCore.Mvc;
using Fixtures.Application.Services;

namespace Fixtures.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FixturesController : ControllerBase
{
    private readonly IFixtureService _fixtureService;
    private readonly ILogger<FixturesController> _logger;

    public FixturesController(IFixtureService fixtureService, ILogger<FixturesController> logger)
    {
        _fixtureService = fixtureService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllFixtures(CancellationToken cancellationToken)
    {
        try
        {
            var fixtures = await _fixtureService.GetAllFixturesAsync(cancellationToken);
            return Ok(fixtures);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all fixtures");
            return StatusCode(500, new { message = "An error occurred while retrieving fixtures" });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetFixtureById(long id, CancellationToken cancellationToken)
    {
        try
        {
            var fixture = await _fixtureService.GetFixtureByIdAsync(id, cancellationToken);
            if (fixture == null)
            {
                return NotFound(new { message = $"Fixture with id {id} not found" });
            }
            return Ok(fixture);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fixture with id {FixtureId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the fixture" });
        }
    }

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetFixturesByDate(string date, CancellationToken cancellationToken)
    {
        try
        {
            if (!DateTime.TryParse(date, out var parsedDate))
            {
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD" });
            }

            var fixtures = await _fixtureService.GetFixturesByDateAsync(parsedDate, cancellationToken);
            return Ok(fixtures);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fixtures for date {Date}", date);
            return StatusCode(500, new { message = "An error occurred while retrieving fixtures" });
        }
    }

    [HttpGet("team/{teamId:long}")]
    public async Task<IActionResult> GetFixturesByTeamId(long teamId, CancellationToken cancellationToken)
    {
        try
        {
            var fixtures = await _fixtureService.GetFixturesByTeamIdAsync(teamId, cancellationToken);
            return Ok(fixtures);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fixtures for team {TeamId}", teamId);
            return StatusCode(500, new { message = "An error occurred while retrieving fixtures" });
        }
    }

    [HttpGet("live")]
    public async Task<IActionResult> GetLiveFixtures(CancellationToken cancellationToken)
    {
        try
        {
            var fixtures = await _fixtureService.GetLiveFixturesAsync(cancellationToken);
            return Ok(fixtures);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving live fixtures");
            return StatusCode(500, new { message = "An error occurred while retrieving live fixtures" });
        }
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetTodayFixtures(CancellationToken cancellationToken)
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var fixtures = await _fixtureService.GetFixturesByDateAsync(today, cancellationToken);
            return Ok(fixtures);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving today's fixtures");
            return StatusCode(500, new { message = "An error occurred while retrieving fixtures" });
        }
    }
}
