import type { Task } from "../types/api";
import type { TaskListItemElement } from "../types/dom";

import taskToggleHandler from "../listeners/taskToggleHandler";
import taskDeleteHandler from "../listeners/taskDeleteHandler";
import taskEditHandler from "../listeners/taskEditHandler";

export default function taskRender(task: Task, idUser: number): TaskListItemElement {
  const liElement = document.createElement("li") as TaskListItemElement;
  liElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
  liElement.taskId = task.id;
  liElement.userId = idUser;

  const nameElement = document.createElement("span");
  nameElement.innerText = task.name;
  nameElement.classList.add("flex-grow-1");

  liElement.append(nameElement);

  const checkboxElement = document.createElement("input");
  checkboxElement.type = "checkbox";
  checkboxElement.classList.add("form-check-input", "me-3");
  checkboxElement.checked = task.is_done;
  checkboxElement.addEventListener("change", taskToggleHandler);
  liElement.prepend(checkboxElement);

  if (task.is_done) {
    nameElement.classList.add("text-decoration-line-through", "text-muted");
  }

  const actionsElement = document.createElement("div");
  actionsElement.classList.add("d-flex", "gap-2");

  const buttonEditElement = document.createElement("button");
  buttonEditElement.classList.add("btn", "btn-secondary", "btn-sm");
  buttonEditElement.innerText = "Editar";
  buttonEditElement.addEventListener("click", taskEditHandler);

  const buttonDeleteElement = document.createElement("button");
  buttonDeleteElement.classList.add("btn", "btn-danger", "btn-sm");
  buttonDeleteElement.innerText = "Excluir";
  buttonDeleteElement.addEventListener("click", taskDeleteHandler);

  actionsElement.append(buttonEditElement, buttonDeleteElement);
  liElement.append(actionsElement);

  return liElement;
}
