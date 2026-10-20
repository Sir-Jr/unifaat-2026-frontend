/**
 * Faz logout do usuário apagando o cookie de autenticação.
 *
 * O cookie "auth_token" é HttpOnly, então o JavaScript do navegador não
 * consegue removê-lo: só o backend pode (via Set-Cookie expirado).
 *
 * Rota: POST /api/logout
 */
export default function LogoutController(request, response) {
    // As opções precisam bater com as do login para o navegador apagar o cookie
    response.clearCookie("auth_token", {
        httpOnly: true,
        sameSite: "lax"
    });

    return response.status(204).send();
}
