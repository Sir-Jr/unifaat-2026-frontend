import type { PaginatedResponse, User } from "../types/api";

function totalText(total: number): string {
  if (total === 1) return "1 usuário encontrado";

  return `${total} usuários encontrados`;
}

function locationText(user: User): string {
  const parts = [user.city, user.state].filter((part): part is string => Boolean(part));

  if (parts.length === 0) return "Local não informado";

  return parts.join("/");
}

function userResultRender(user: User, onChoose: (user: User) => void): HTMLLIElement {
  const liElement = document.createElement("li");
  liElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "gap-2");

  const infoElement = document.createElement("div");
  infoElement.classList.add("text-start");

  const nameElement = document.createElement("div");
  nameElement.classList.add("fw-semibold");
  nameElement.innerText = user.name;

  const emailElement = document.createElement("div");
  emailElement.classList.add("small", "text-muted");
  emailElement.innerText = user.email;

  const detailsElement = document.createElement("div");
  detailsElement.classList.add("small");
  detailsElement.innerText = `${user.job_title ?? "Cargo não informado"} · ${locationText(user)}`;

  infoElement.append(nameElement, emailElement, detailsElement);

  const chooseButton = document.createElement("button");
  chooseButton.type = "button";
  chooseButton.classList.add("btn", "btn-outline-primary", "btn-sm");
  chooseButton.innerText = "Escolher";
  chooseButton.addEventListener("click", () => onChoose(user));

  liElement.append(infoElement, chooseButton);

  return liElement;
}

export default function userSearchResultsRender(
  container: HTMLElement,
  result: PaginatedResponse<User>,
  onChoose: (user: User) => void
): void {
  container.innerHTML = "";

  const totalElement = document.createElement("p");
  totalElement.classList.add("small", "text-muted", "mb-2");
  container.append(totalElement);

  if (result.data.length === 0) {
    totalElement.innerText = "Nenhum usuário encontrado";
    return;
  }

  totalElement.innerText = totalText(result.total);

  const ulElement = document.createElement("ul");
  ulElement.classList.add("list-group");

  result.data.forEach((user) => {
    ulElement.append(userResultRender(user, onChoose));
  });

  container.append(ulElement);
}
