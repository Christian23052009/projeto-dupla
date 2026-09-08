using Microsoft.EntityFrameworkCore;
using trabalho_cadastro_dupla.Models;

namespace trabalho_cadastro_dupla.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Chamado> Chamados { get; set; }
}