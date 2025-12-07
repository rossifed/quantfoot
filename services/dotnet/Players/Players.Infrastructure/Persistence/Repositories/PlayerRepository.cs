using Microsoft.EntityFrameworkCore;
using Players.Domain.Entities;
using Players.Domain.Repositories;

namespace Players.Infrastructure.Persistence.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly PlayersDbContext _context;

    public PlayerRepository(PlayersDbContext context)
    {
        _context = context;
    }

    public async Task<Player?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Players
            .Include(p => p.Team)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Player>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Players
            .Include(p => p.Team)
            .Take(100) // Limit for now
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Player>> GetByTeamIdAsync(long teamId, CancellationToken cancellationToken = default)
    {
        return await _context.Players
            .Include(p => p.Team)
            .Where(p => p.TeamId == teamId)
            .OrderBy(p => p.Position)
            .ToListAsync(cancellationToken);
    }
}
