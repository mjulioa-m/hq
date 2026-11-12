export async function apiSend(url: string, method: string, body?: unknown) {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No pudimos conectar. Revisa tu conexión e intenta de nuevo.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    if (data.error) throw new Error(data.error);
    if (res.status === 401) throw new Error("Tu sesión se cerró. Vuelve a entrar.");
    if (res.status >= 500) throw new Error("Algo falló en el servidor. Intenta de nuevo en un momento.");
    throw new Error("No se pudo guardar.");
  }
  return data;
}
