using Ey.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ey.Api.Data;

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> options) : base(options) { }

    public DbSet<Incident> Incidents => Set<Incident>();
}
