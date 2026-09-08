namespace trabalho_cadastro_dupla.Models;

public enum StatusChamado
{
    Pendente = 0,
    EmAndamento = 1,
    Resolvido = 2
}

public class Chamado
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public StatusChamado Status { get; set; } = StatusChamado.Pendente;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}