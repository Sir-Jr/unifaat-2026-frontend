import tasksListRender from "../render/tasksListRender";
import { taskUpdateApi } from "../api/taskUpdateApi";
import type { TaskListItemElement } from "../types/dom";

/**
 * Handler do botão "Editar". Tem dois estados:
 *  1. Modo leitura: troca o <span> do nome por um <input> e o botão vira "Salvar"
 *  2. Modo edição: salva o novo nome (também via Enter; Esc cancela)
 */
export default async function taskEditHandler(event: Event): Promise<void> {
  const buttonElement = event.currentTarget as HTMLButtonElement;
  const liElement = buttonElement.closest("li") as TaskListItemElement | null;
  if (!liElement) return;

  const { userId: idUser, taskId } = liElement;
  const inputElement = liElement.querySelector<HTMLInputElement>("input[type=text]");

  // Estado 1: entra no modo edição
  if (!inputElement) {
    const nameElement = liElement.querySelector<HTMLSpanElement>("span");
    if (!nameElement) return;

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.value = nameElement.innerText;
    newInput.classList.add("form-control", "form-control-sm", "flex-grow-1", "me-2");

    newInput.addEventListener("keydown", (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Enter") buttonElement.click();
      if (keyEvent.key === "Escape") tasksListRender(idUser);
    });

    nameElement.replaceWith(newInput);
    buttonElement.innerText = "Salvar";
    newInput.focus();
    return;
  }

  // Estado 2: salva o novo nome
  const newName = inputElement.value.trim();

  if (!newName) {
    alert("O nome da tarefa não pode ficar vazio!");
    inputElement.focus();
    return;
  }

  try {
    await taskUpdateApi(taskId, { name: newName });
    await tasksListRender(idUser);
  } catch (error) {
    alert("Erro ao editar tarefa");
    console.error(error);
  }
}
