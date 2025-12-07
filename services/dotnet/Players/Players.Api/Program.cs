using Microsoft.EntityFrameworkCore;
using Players.Application.Services;
using Players.Domain.Repositories;
using Players.Infrastructure.Persistence;
using Players.Infrastructure.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<PlayersDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PlayersDb")));

// Repositories
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();

// Application Services
builder.Services.AddScoped<IPlayerService, PlayerService>();

// CORS for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3001", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
