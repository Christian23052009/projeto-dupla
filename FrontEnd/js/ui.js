/**
 * UI Manager - Manipulação do DOM
 * Responsável por renderizar elementos, gerenciar modais e feedback visual
 */

export class UIManager {
  constructor() {
    // Elementos principais
    this.listaContainer = document.getElementById("listaChamados");
    this.loadingElement = document.getElementById("loading");
    this.toastContainer = document.getElementById("toastContainer");
    this.totalElement = document.getElementById("totalChamados");

    // Modais
    this.modalCriar = document.getElementById("modalCriar");
    this.modalExcluir = document.getElementById("modalExcluir");

    // Formulário
    this.formChamado = document.getElementById("formChamado");

    // Estado
    this.chamadoParaExcluir = null;
  }

  /**
   * Mostra o indicador de loading
   */
  mostrarLoading() {
    this.loadingElement.classList.remove("hidden");
    this.listaContainer.innerHTML = "";
  }

  /**
   * Esconde o indicador de loading
   */
  esconderLoading() {
    this.loadingElement.classList.add("hidden");
  }

  /**
   * Renderiza a lista de chamados
   * @param {Array} chamados - Lista de chamados
   */
  renderizarChamados(chamados) {
    if (!chamados || chamados.length === 0) {
      this.listaContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <h3>Nenhum chamado encontrado</h3>
                    <p>Clique em "Novo Chamado" para criar o primeiro</p>
                </div>
            `;
      this.totalElement.textContent = "0";
      return;
    }

    this.listaContainer.innerHTML = chamados
      .map((c) => this.criarCardChamado(c))
      .join("");
    this.totalElement.textContent = chamados.length;
  }

  /**
   * Cria o HTML de um card de chamado
   * @param {Object} chamado - Dados do chamado
   * @returns {string} HTML do card
   */
  criarCardChamado(chamado) {
    const statusMap = {
      Pendente: { class: "status-pendente", icon: "⏳" },
      EmAndamento: { class: "status-andamento", icon: "🔄" },
      Resolvido: { class: "status-resolvido", icon: "✅" },
    };

    const statusInfo = statusMap[chamado.status] || statusMap["Pendente"];

    const prioridadeClass =
      {
        Alta: "prioridade-alta",
        Média: "prioridade-media",
        Baixa: "prioridade-baixa",
      }[chamado.prioridade] || "";

    // Escapa caracteres especiais para evitar XSS
    const titulo = this.escapeHtml(chamado.titulo);
    const descricao = this.escapeHtml(chamado.descricao);
    const categoria = this.escapeHtml(chamado.categoria);

    return `
            <div class="card-chamado" data-id="${chamado.id}">
                <div class="card-header">
                    <h3>#${chamado.id} - ${titulo}</h3>
                    <span class="status-badge ${statusInfo.class}">${
      statusInfo.icon
    } ${chamado.status}</span>
                </div>
                <div class="card-body">
                    <p class="descricao">${descricao}</p>
                    <div class="meta-info">
                        <span class="categoria">📂 ${categoria}</span>
                        <span class="prioridade ${prioridadeClass}">🚩 ${
      chamado.prioridade
    }</span>
                        <span class="data">📅 ${chamado.dataCriacao}</span>
                    </div>
                </div>
                <div class="card-footer">
                    ${
                      chamado.status !== "EmAndamento"
                        ? `
                        <button onclick="window.atualizarStatus(${chamado.id}, 'EmAndamento')" 
                                class="btn btn-warning btn-sm">
                            🔄 Em Andamento
                        </button>
                    `
                        : ""
                    }
                    ${
                      chamado.status !== "Resolvido"
                        ? `
                        <button onclick="window.atualizarStatus(${chamado.id}, 'Resolvido')" 
                                class="btn btn-success btn-sm">
                            ✅ Resolver
                        </button>
                    `
                        : ""
                    }
                    <button onclick="window.abrirModalExclusao(${
                      chamado.id
                    }, '${titulo}')" 
                            class="btn btn-danger btn-sm">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Escapa caracteres especiais para prevenir XSS
   * @param {string} text - Texto a ser escapado
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Mostra um toast de notificação
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {string} tipo - Tipo (success, error, warning)
   * @param {number} duracao - Duração em ms (padrão: 4000)
   */
  mostrarToast(mensagem, tipo = "success", duracao = 4000) {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
            <span class="toast-icon">${icons[tipo] || "ℹ️"}</span>
            <span class="toast-message">${this.escapeHtml(mensagem)}</span>
            <button class="toast-close">&times;</button>
        `;

    this.toastContainer.appendChild(toast);

    // Fechar manualmente
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      this.fecharToast(toast);
    });

    // Auto-fechar
    setTimeout(() => {
      this.fecharToast(toast);
    }, duracao);
  }

  /**
   * Fecha um toast com animação
   * @param {HTMLElement} toast - Elemento do toast
   */
  fecharToast(toast) {
    if (!toast || toast.classList.contains("toast-fade-out")) return;
    toast.classList.add("toast-fade-out");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }

  /**
   * Mostra um toast de erro
   * @param {string} mensagem - Mensagem de erro
   */
  mostrarErro(mensagem) {
    this.mostrarToast(mensagem, "error");
  }

  /**
   * Abre o modal de criação de chamado
   */
  abrirModalCriar() {
    this.modalCriar.classList.add("ativo");
    this.formChamado.reset();
    this.limparErrosValidacao();
    document.getElementById("titulo").focus();
  }

  /**
   * Fecha o modal de criação de chamado
   */
  fecharModalCriar() {
    this.modalCriar.classList.remove("ativo");
  }

  /**
   * Abre o modal de confirmação de exclusão
   * @param {number} id - ID do chamado
   * @param {string} titulo - Título do chamado
   */
  abrirModalExclusao(id, titulo) {
    this.chamadoParaExcluir = id;
    document.getElementById(
      "excluirTitulo"
    ).textContent = `#${id} - ${this.escapeHtml(titulo)}`;
    document.getElementById("btnConfirmarExcluir").dataset.id = id;
    this.modalExcluir.classList.add("ativo");
  }

  /**
   * Fecha o modal de confirmação de exclusão
   */
  fecharModalExclusao() {
    this.modalExcluir.classList.remove("ativo");
    this.chamadoParaExcluir = null;
  }

  /**
   * Mostra erro de validação em um campo
   * @param {string} campo - Nome do campo
   * @param {string} mensagem - Mensagem de erro
   */
  mostrarErroValidacao(campo, mensagem) {
    const errorElement = document.getElementById(
      `erro${campo.charAt(0).toUpperCase() + campo.slice(1)}`
    );
    if (errorElement) {
      errorElement.textContent = mensagem;
      const input = document.getElementById(campo);
      if (input) {
        input.classList.add("error");
      }
    }
  }

  /**
   * Limpa todos os erros de validação
   */
  limparErrosValidacao() {
    document.querySelectorAll(".form-error").forEach((el) => {
      el.textContent = "";
    });
    document.querySelectorAll(".form-control.error").forEach((el) => {
      el.classList.remove("error");
    });
  }

  /**
   * Atualiza o contador total de chamados
   * @param {number} total - Total de chamados
   */
  atualizarContador(total) {
    this.totalElement.textContent = total;
  }
}
