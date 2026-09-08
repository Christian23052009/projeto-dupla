using trabalho_cadastro_dupla.Data;
using trabalho_cadastro_dupla.DTOs;
using trabalho_cadastro_dupla.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace trabalho_cadastro_dupla.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChamadosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChamadosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Chamado>>> Get([FromQuery] StatusChamado? status)
    {
        var query = _context.Chamados.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        return Ok(await query.ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Chamado>> Post([FromBody] CriarChamadoDTO dto)
    {
        var chamado = new Chamado
        {
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            Categoria = dto.Categoria,
            Status = StatusChamado.Pendente,
            DataCriacao = DateTime.UtcNow
        };

        _context.Chamados.Add(chamado);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = chamado.Id }, chamado);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> PutStatus(int id, [FromBody] AtualizarStatusDTO dto)
    {
        var chamado = await _context.Chamados.FindAsync(id);
        if (chamado == null)
        {
            return NotFound(new { mensagem = "Chamado não encontrado." });
        }

        chamado.Status = dto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var chamado = await _context.Chamados.FindAsync(id);
        if (chamado == null)
        {
            return NotFound(new { mensagem = "Chamado não encontrado." });
        }

        _context.Chamados.Remove(chamado);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}