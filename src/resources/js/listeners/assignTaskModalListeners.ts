import { AxiosError } from "axios";
import { userSearchApi } from "../api/userSearchApi";
import { taskCreateApi } from "../api/taskCreateApi";
import tasksListRender from "../render/tasksListRender";
import userSearchResultsRender from "../render/userSearchResultsRender";
import type { User, UserSearchFilters } from "../types/api";

// Campos de texto que podem ser escolhidos no <select> da busca
type TextSearchField = Exclude<keyof UserSearchFilters, "is_active">;

const TEXT_SEARCH_FIELDS: TextSearchField[] = ["name", "email", "job_title", "city", "state", "bio"];

function isTextSearchField(value: string): value is TextSearchField {
  return (TEXT_SEARCH_FIELDS as string[]).includes(value);
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && typeof error.response?.data?.error === "string") {
    return error.response.data.error;
  }

  return fallback;
}

export default function assignTaskModalListeners(idUser: number): void {
  const modalElement = document.querySelector<HTMLDivElement>("#assign-task-modal");
  const taskNameInput = document.querySelector<HTMLInputElement>("#assign-task-name");
  const searchFieldSelect = document.querySelector<HTMLSelectElement>("#assign-search-field");
  const searchValueInput = document.querySelector<HTMLInputElement>("#assign-search-value");
  const searchButton = document.querySelector<HTMLButtonElement>("#assign-search-btn");
  const resultsContainer = document.querySelector<HTMLDivElement>("#assign-search-results");
  const selectedUserElement = document.querySelector<HTMLDivElement>("#assign-selected-user");
  const modalMessageElement = document.querySelector<HTMLDivElement>("#assign-task-message");
  const submitButton = document.querySelector<HTMLButtonElement>("#assign-task-submit");
  const dismissButton = modalElement?.querySelector<HTMLButtonElement>("[data-bs-dismiss='modal']");
  const pageFeedbackElement = document.querySelector<HTMLDivElement>("#tasks-feedback");

  if (
    !modalElement ||
    !taskNameInput ||
    !searchFieldSelect ||
    !searchValueInput ||
    !searchButton ||
    !resultsContainer ||
    !selectedUserElement ||
    !modalMessageElement ||
    !submitButton
  ) {
    return;
  }

  let selectedUser: User | null = null;

  const showModalMessage = (text: string, type: "danger" | "warning"): void => {
    modalMessageElement.className = `alert alert-${type} py-2 small`;
    modalMessageElement.innerText = text;
  };

  const hideModalMessage = (): void => {
    modalMessageElement.className = "d-none";
    modalMessageElement.innerText = "";
  };

  const updateSubmitState = (): void => {
    const hasName = taskNameInput.value.trim() !== "";
    submitButton.disabled = !hasName || selectedUser === null;
  };

  const renderSelectedUser = (): void => {
    selectedUserElement.innerText = "Nenhum usuário escolhido";
    selectedUserElement.classList.add("text-muted");

    if (!selectedUser) return;

    selectedUserElement.innerText = `Atribuir para: ${selectedUser.name} (${selectedUser.email})`;
    selectedUserElement.classList.remove("text-muted");
  };

  const chooseUser = (user: User): void => {
    selectedUser = user;
    hideModalMessage();
    renderSelectedUser();
    updateSubmitState();
  };

  const resetModal = (): void => {
    selectedUser = null;
    taskNameInput.value = "";
    searchValueInput.value = "";
    searchFieldSelect.selectedIndex = 0;
    resultsContainer.innerHTML = "";
    hideModalMessage();
    renderSelectedUser();
    updateSubmitState();
  };

  const showPageFeedback = (text: string): void => {
    if (!pageFeedbackElement) return;

    pageFeedbackElement.innerText = text;
    pageFeedbackElement.classList.remove("d-none");
  };

  const searchUsers = async (): Promise<void> => {
    const field = searchFieldSelect.value;
    const value = searchValueInput.value.trim();

    hideModalMessage();

    if (!value) {
      showModalMessage("Digite algo para buscar.", "warning");
      return;
    }

    if (!isTextSearchField(field)) {
      showModalMessage("Escolha um campo de busca válido.", "warning");
      return;
    }

    const filters: UserSearchFilters = { [field]: value };

    searchButton.disabled = true;

    try {
      const result = await userSearchApi(filters, 1, 10);
      userSearchResultsRender(resultsContainer, result, chooseUser);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      resultsContainer.innerHTML = "";
      showModalMessage(apiErrorMessage(error, "Erro ao buscar usuários. Tente novamente."), "danger");
    } finally {
      searchButton.disabled = false;
    }
  };

  const createTask = async (): Promise<void> => {
    const name = taskNameInput.value.trim();

    hideModalMessage();

    if (!name) {
      showModalMessage("Digite o nome da tarefa.", "warning");
      return;
    }

    if (!selectedUser) {
      showModalMessage("Busque e escolha um usuário.", "warning");
      return;
    }

    const targetUser = selectedUser;

    submitButton.disabled = true;

    try {
      await taskCreateApi(targetUser.id, { name });
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      showModalMessage(apiErrorMessage(error, "Erro ao criar tarefa. Tente novamente."), "danger");
      updateSubmitState();
      return;
    }

    // Fecha o modal pelo próprio botão "Cancelar" (data-bs-dismiss)
    dismissButton?.click();
    resetModal();
    showPageFeedback(`Tarefa criada para ${targetUser.name}`);

    if (targetUser.id !== idUser) return;

    try {
      await tasksListRender(idUser);
    } catch (error) {
      console.error("Erro ao recarregar tarefas:", error);
    }
  };

  searchButton.addEventListener("click", searchUsers);

  searchValueInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    searchUsers();
  });

  taskNameInput.addEventListener("input", updateSubmitState);
  submitButton.addEventListener("click", createTask);

  // Fechou pelo "Cancelar" ou pelo X: começa limpo na próxima vez
  modalElement.addEventListener("hidden.bs.modal", resetModal);

  resetModal();
}
