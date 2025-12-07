using Microsoft.EntityFrameworkCore;
using Teams.Domain.Entities;
using Teams.Domain.Repositories;

namespace Teams.Infrastructure.Persistence.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly TeamsDbContext _context;

    public TeamRepository(TeamsDbContext context)
    {
        _context = context;
    }

    public async Task<Team?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Team>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Team>> GetByCountryAsync(string country, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .Where(t => t.TeamCountry == country)
            .ToListAsync(cancellationToken);
    }

    public async Task<Team?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .FirstOrDefaultAsync(t => t.TeamName == name, cancellationToken);
    }
}
