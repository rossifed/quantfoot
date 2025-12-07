using Microsoft.EntityFrameworkCore;
using Fixtures.Domain.Entities;
using Fixtures.Domain.Repositories;

namespace Fixtures.Infrastructure.Persistence.Repositories;

public class FixtureRepository : IFixtureRepository
{
    private readonly FixturesDbContext _context;

    public FixtureRepository(FixturesDbContext context)
    {
        _context = context;
    }

    public async Task<Fixture?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Fixtures
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Fixture>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Fixtures
            .OrderByDescending(f => f.FixtureDate)
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Fixture>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var startDate = date.Date;
        var endDate = startDate.AddDays(1);
        
        return await _context.Fixtures
            .Where(f => f.FixtureDate >= startDate && f.FixtureDate < endDate)
            .OrderBy(f => f.FixtureDatetime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Fixture>> GetByTeamIdAsync(long teamId, CancellationToken cancellationToken = default)
    {
        return await _context.Fixtures
            .Where(f => f.HomeTeamId == teamId || f.AwayTeamId == teamId)
            .OrderByDescending(f => f.FixtureDate)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Fixture>> GetByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await _context.Fixtures
            .Where(f => f.Status == status)
            .OrderBy(f => f.FixtureDatetime)
            .ToListAsync(cancellationToken);
    }
}
