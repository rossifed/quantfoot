using Fixtures.Application.DTOs;
using Fixtures.Domain.Entities;
using Fixtures.Domain.Repositories;

namespace Fixtures.Application.Services;

public class FixtureService : IFixtureService
{
    private readonly IFixtureRepository _fixtureRepository;

    public FixtureService(IFixtureRepository fixtureRepository)
    {
        _fixtureRepository = fixtureRepository;
    }

    public async Task<FixtureResponse?> GetFixtureByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var fixture = await _fixtureRepository.GetByIdAsync(id, cancellationToken);
        return fixture != null ? MapToResponse(fixture) : null;
    }

    public async Task<IEnumerable<FixtureResponse>> GetAllFixturesAsync(CancellationToken cancellationToken = default)
    {
        var fixtures = await _fixtureRepository.GetAllAsync(cancellationToken);
        return fixtures.Select(MapToResponse);
    }

    public async Task<IEnumerable<FixtureResponse>> GetFixturesByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var fixtures = await _fixtureRepository.GetByDateAsync(date, cancellationToken);
        return fixtures.Select(MapToResponse);
    }

    public async Task<IEnumerable<FixtureResponse>> GetFixturesByTeamIdAsync(long teamId, CancellationToken cancellationToken = default)
    {
        var fixtures = await _fixtureRepository.GetByTeamIdAsync(teamId, cancellationToken);
        return fixtures.Select(MapToResponse);
    }

    public async Task<IEnumerable<FixtureResponse>> GetLiveFixturesAsync(CancellationToken cancellationToken = default)
    {
        var fixtures = await _fixtureRepository.GetByStatusAsync("LIVE", cancellationToken);
        return fixtures.Select(MapToResponse);
    }

    private static FixtureResponse MapToResponse(Fixture fixture)
    {
        return new FixtureResponse(
            fixture.Id,
            fixture.FixtureDatetime,
            fixture.FixtureDate,
            fixture.Season,
            fixture.Status,
            fixture.StatusLong,
            fixture.MinutesElapsed,
            new LeagueDto(
                fixture.LeagueId,
                fixture.LeagueName,
                fixture.LeagueType,
                fixture.LeagueCountry,
                fixture.LeagueRound
            ),
            fixture.VenueId != null ? new VenueInfoDto(
                fixture.VenueId,
                fixture.VenueName,
                fixture.VenueCity,
                fixture.VenueCapacity
            ) : null,
            new TeamInFixtureDto(
                fixture.HomeTeamId,
                fixture.HomeTeamName,
                fixture.HomeTeamCode,
                fixture.HomeTeamWinner
            ),
            new TeamInFixtureDto(
                fixture.AwayTeamId,
                fixture.AwayTeamName,
                fixture.AwayTeamCode,
                fixture.AwayTeamWinner
            ),
            new ScoreDto(
                fixture.GoalsHome,
                fixture.GoalsAway,
                fixture.HalftimeHome,
                fixture.HalftimeAway,
                fixture.FulltimeHome,
                fixture.FulltimeAway,
                fixture.TotalGoals,
                fixture.GoalDifference
            ),
            fixture.Result,
            fixture.Referee,
            fixture.IsLive(),
            fixture.IsFinished()
        );
    }
}
