import clientApi from "./_clientApi";

export async function logoutApi(): Promise<void> {
  await clientApi.post("/api/logout");
}
