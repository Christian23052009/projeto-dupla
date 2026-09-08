/**
 * App - Controlador Principal
 * Responsável por orquestrar a aplicação, eventos e fluxo de dados
 */

import { ChamadoAPI } from "./api.js";
import { UIManager } from "./ui.js";

class App {
  constructor() {
    // Inicializa o UI Manager
    this.ui = new UIManager();

    // Estado da aplicação
    this.filtroAtual = "";
    this.buscaAtual = "";
    this.chamados = [];

    // Inicializa a aplicação
    this.init();
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    // Carrega os chamados
    this.carregarChamados();

    // Eventos do formulário de criação
    this.form = document.getElementById("formChamado");
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.criarChamado();
    });

    // Eventos do modal de criação
    document.getElementById("btnAbrirModal").addEventListener("click", () => {
      this.ui.abrirModalCriar();
    });

    document
      .getElementById("btnFecharModalCriar")
      .addEventListener("click", () => {
        this.ui.fecharModalCriar();
      });

    document
      .getElementById("btnCancelarCriar")
      .addEventListener("click", () => {
        this.ui.fecharModalCriar();
      });

    // Fechar modal clicando fora
    this.modalCriar = document.getElementById("modalCriar");
    this.modalCriar.addEventListener("click", (e) => {
      if (e.target === this.modalCriar) {
        this.ui.fecharModalCriar();
      }
    });

    // Eventos dos filtros
    document.getElementById("filtroStatus").addEventListener("change", (e) => {
      this.filtroAtual = e.target.value;
      this.aplicarFiltros();
    });

    document.getElementById("filtroBusca").addEventListener("input", (e) => {
      this.buscaAtual = e.target.value.toLowerCase().trim();
      this.aplicarFiltros();
    });

    document
      .getElementById("btnLimparFiltros")
      .addEventListener("click", () => {
        document.getElementById("filtroStatus").value = "";
        document.getElementById("filtroBusca").value = "";
        this.filtroAtual = "";
        this.buscaAtual = "";
        this.aplicarFiltros();
      });

    // Eventos do modal de exclusão
    document
      .getElementById("btnFecharModalExcluir")
      .addEventListener("click", () => {
        this.ui.fecharModalExclusao();
      });

    document
      .getElementById("btnCancelarExcluir")
      .addEventListener("click", () => {
        this.ui.fecharModalExclusao();
      });

    document
      .getElementById("btnConfirmarExcluir")
      .addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        if (id) this.excluirChamado(id);
      });

    // Fechar modal de exclusão clicando fora
    this.modalExcluir = document.getElementById("modalExcluir");
    this.modalExcluir.addEventListener("click", (e) => {
      if (e.target === this.modalExcluir) {
        this.ui.fecharModalExclusao();
      }
    });

    // Validação em tempo real do título
    document.getElementById("titulo").addEventListener("input", (e) => {
      const value = e.target.value.trim();
      const errorEl = document.getElementById("erroTitulo");
      if (value.length > 0 && value.length < 5) {
        errorEl.textContent = "Título deve ter no mínimo 5 caracteres";
        e.target.classList.add("error");
      } else {
        errorEl.textContent = "";
        e.target.classList.remove("error");
      }
    });

    // Expor funções globalmente para os botões dos cards
    window.atualizarStatus = this.atualizarStatus.bind(this);
    window.abrirModalExclusao = this.ui.abrirModalExclusao.bind(this.ui);
  }

  /**
   * Carrega os chamados da API
   */
  async carregarChamados() {
    this.ui.mostrarLoading();
    try {
      this.chamados = await ChamadoAPI.listar(this.filtroAtual);
      this.aplicarFiltros();
    } catch (error) {
      this.ui.mostrarErro("Erro ao carregar chamados: " + error.message);
      this.ui.renderizarChamados([]);
    } finally {
      this.ui.esconderLoading();
    }
  }

  /**
   * Aplica os filtros (status e busca) aos chamados
   */
  aplicarFiltros() {
    let chamadosFiltrados = [...this.chamados];

    // Filtro por busca (frontend)
    if (this.buscaAtual) {
      chamadosFiltrados = chamadosFiltrados.filter(
        (c) =>
          c.titulo.toLowerCase().includes(this.buscaAtual) ||
          c.descricao.toLowerCase().includes(this.buscaAtual) ||
          c.categoria.toLowerCase().includes(this.buscaAtual)
      );
    }

    this.ui.renderizarChamados(chamadosFiltrados);
    this.ui.atualizarContador(chamadosFiltrados.length);
  }

  /**
   * Cria um novo chamado
   */
  async criarChamado() {
    // Limpa erros anteriores
    this.ui.limparErrosValidacao();

    // Coleta os dados
    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const categoria = document.getElementById("categoria").value;
    const prioridade = document.getElementById("prioridade").value;

    // Validações
    let isValid = true;

    if (titulo.length < 5) {
      this.ui.mostrarErroValidacao(
        "titulo",
        "Título deve ter no mínimo 5 caracteres"
      );
      isValid = false;
    }

    if (!descricao || descricao.length < 10) {
      this.ui.mostrarErroValidacao(
        "descricao",
        "Descrição deve ter no mínimo 10 caracteres"
      );
      isValid = false;
    }

    if (!categoria) {
      this.ui.mostrarErroValidacao("categoria", "Selecione uma categoria");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Desabilita o botão durante a requisição
    const btnCriar = document.getElementById("btnCriarChamado");
    btnCriar.disabled = true;
    btnCriar.textContent = "⏳ Criando...";

    try {
      const dados = { titulo, descricao, categoria, prioridade };
      const novoChamado = await ChamadoAPI.criar(dados);

      this.ui.mostrarToast("Chamado criado com sucesso!", "success");
      this.ui.fecharModalCriar();

      // Recarrega a lista
      await this.carregarChamados();
    } catch (error) {
      this.ui.mostrarErro("Erro ao criar chamado: " + error.message);
    } finally {
      btnCriar.disabled = false;
      btnCriar.textContent = "✅ Criar Chamado";
    }
  }

  /**
   * Atualiza o status de um chamado
   * @param {number} id - ID do chamado
   * @param {string} novoStatus - Novo status
   */
  async atualizarStatus(id, novoStatus) {
    try {
      await ChamadoAPI.atualizarStatus(id, novoStatus);

      const statusLabel =
        {
          EmAndamento: "Em Andamento",
          Resolvido: "Resolvido",
        }[novoStatus] || novoStatus;

      this.ui.mostrarToast(`Status atualizado para ${statusLabel}!`, "success");

      // Recarrega a lista
      await this.carregarChamados();
    } catch (error) {
      this.ui.mostrarErro("Erro ao atualizar status: " + error.message);
    }
  }

  /**
   * Exclui um chamado
   * @param {number} id - ID do chamado
   */
  async excluirChamado(id) {
    try {
      await ChamadoAPI.excluir(id);

      this.ui.mostrarToast("Chamado excluído com sucesso!", "success");
      this.ui.fecharModalExclusao();

      // Recarrega a lista
      await this.carregarChamados();
    } catch (error) {
      this.ui.mostrarErro("Erro ao excluir chamado: " + error.message);
    }
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
});
