/**
 * API Service - Comunicação com o backend
 * Responsável por todas as requisições HTTP para a API
 */

const API_BASE_URL = "https://localhost:5001/api";

export class ChamadoAPI {
  /**
   * Lista todos os chamados, com filtro opcional por status
   * @param {string} status - Filtro opcional (Pendente, EmAndamento, Resolvido)
   * @returns {Promise<Array>} Lista de chamados
   */
  static async listar(status = "") {
    const url = status
      ? `${API_BASE_URL}/chamados?status=${status}`
      : `${API_BASE_URL}/chamados`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao listar chamados");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição listar:", error);
      throw error;
    }
  }

  /**
   * Obtém um chamado específico por ID
   * @param {number} id - ID do chamado
   * @returns {Promise<Object>} Dados do chamado
   */
  static async obterPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/chamados/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Chamado não encontrado");
        }
        const error = await response.json();
        throw new Error(error.message || "Erro ao obter chamado");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição obterPorId:", error);
      throw error;
    }
  }

  /**
   * Cria um novo chamado
   * @param {Object} dados - Dados do chamado
   * @param {string} dados.titulo - Título (mínimo 5 caracteres)
   * @param {string} dados.descricao - Descrição
   * @param {string} dados.categoria - Categoria
   * @param {string} dados.prioridade - Prioridade (Baixa, Média, Alta)
   * @returns {Promise<Object>} Chamado criado
   */
  static async criar(dados) {
    try {
      const response = await fetch(`${API_BASE_URL}/chamados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const error = await response.json();
        // Extrai mensagens de erro de validação
        if (error.errors) {
          const messages = Object.values(error.errors).flat();
          throw new Error(messages.join(". "));
        }
        throw new Error(error.message || "Erro ao criar chamado");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição criar:", error);
      throw error;
    }
  }

  /**
   * Atualiza o status de um chamado
   * @param {number} id - ID do chamado
   * @param {string} status - Novo status (Pendente, EmAndamento, Resolvido)
   * @returns {Promise<boolean>} Sucesso da operação
   */
  static async atualizarStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/chamados/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Chamado não encontrado");
        }
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar status");
      }

      return true;
    } catch (error) {
      console.error("Erro na requisição atualizarStatus:", error);
      throw error;
    }
  }

  /**
   * Exclui um chamado do sistema
   * @param {number} id - ID do chamado
   * @returns {Promise<boolean>} Sucesso da operação
   */
  static async excluir(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/chamados/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Chamado não encontrado");
        }
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir chamado");
      }

      return true;
    } catch (error) {
      console.error("Erro na requisição excluir:", error);
      throw error;
    }
  }
}
