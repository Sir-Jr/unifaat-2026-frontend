import taskRender from "./taskRender";
import { tasksListApi } from "../api/tasksListApi";

// Lembra a página atual para que criar/editar/excluir recarreguem a mesma página
let currentPage = 1;

export default async function tasksListRender(idUser: number, page = currentPage): Promise<void> {
  const container = document.querySelector("#tasks-container");

  if (!container) return;

  container.innerHTML = "";

  const ulElement = document.createElement("ul");
  ulElement.id = "tasks-list";
  ulElement.classList.add("list-group");

  container.append(ulElement);

  const listApi = await tasksListApi({ page });

  const totalPages = Math.max(1, Math.ceil(listApi.total / listApi.limit));

  // A página ficou vazia (ex.: excluiu o último item da última página): recua
  if (page > totalPages) {
    await tasksListRender(idUser, totalPages);
    return;
  }

  currentPage = listApi.page;

  ulElement.innerHTML = "";

  if (listApi.data.length === 0) {
    const emptyElement = document.createElement("li");
    emptyElement.classList.add("list-group-item", "text-center", "text-muted");
    emptyElement.innerText = "Nenhuma tarefa encontrada. Crie uma nova!";
    ulElement.append(emptyElement);
    return;
  }

  listApi.data.forEach((task) => {
    const liElement = taskRender(task, idUser);
    ulElement.append(liElement);
  });

  container.append(paginationRender(idUser, listApi.page, totalPages));
}

function paginationRender(idUser: number, page: number, totalPages: number): HTMLElement {
  const navElement = document.createElement("nav");
  navElement.classList.add("d-flex", "justify-content-between", "align-items-center", "mt-3");

  const buttonPrevElement = document.createElement("button");
  buttonPrevElement.classList.add("btn", "btn-outline-primary", "btn-sm");
  buttonPrevElement.innerText = "Anterior";
  buttonPrevElement.disabled = page <= 1;
  buttonPrevElement.addEventListener("click", () => handlePageChange(idUser, page - 1));

  const infoElement = document.createElement("span");
  infoElement.classList.add("text-muted", "small");
  infoElement.innerText = `Página ${page} de ${totalPages}`;

  const buttonNextElement = document.createElement("button");
  buttonNextElement.classList.add("btn", "btn-outline-primary", "btn-sm");
  buttonNextElement.innerText = "Próxima";
  buttonNextElement.disabled = page >= totalPages;
  buttonNextElement.addEventListener("click", () => handlePageChange(idUser, page + 1));

  navElement.append(buttonPrevElement, infoElement, buttonNextElement);

  return navElement;
}

async function handlePageChange(idUser: number, newPage: number): Promise<void> {
  try {
    await tasksListRender(idUser, newPage);
  } catch (error) {
    alert("Erro ao carregar tarefas");
    console.error(error);
  }
}
