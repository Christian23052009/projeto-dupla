using trabalho_cadastro_dupla.Models;

namespace trabalho_cadastro_dupla.DTOs;

// DTO para a criação de um novo chamado (POST)
public class CriarChamadoDTO
{
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
}

// DTO para atualizar apenas o status do chamado (PUT)
public class AtualizarStatusDTO
{
    public StatusChamado Status { get; set; }
}