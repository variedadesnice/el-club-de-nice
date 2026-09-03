import { lazy, ComponentType } from "react";

const RELOAD_FLAG = "chunk_reload_attempted";

/** sessionStorage tira excepción en modo privado de algunos navegadores. */
function safeSession(action: (storage: Storage) => void) {
  try {
    action(window.sessionStorage);
  } catch {
    // Sin sessionStorage no hay protección contra el bucle de recargas, así que
    // el catch de abajo se queda sin red. Es preferible a romper el import.
  }
}

function alreadyReloaded(): boolean {
  try {
    return window.sessionStorage.getItem(RELOAD_FLAG) === "1";
  } catch {
    return false;
  }
}

/**
 * React.lazy() que se recupera de un deploy nuevo.
 *
 * Vite le pone un hash al nombre de cada chunk, así que al publicar una versión
 * el archivo viejo desaparece del servidor. Una pestaña que quedó abierta sigue
 * con el index.html anterior en memoria y pide esos nombres viejos: el chunk ya
 * no existe, la SPA devuelve index.html para cualquier ruta desconocida y el
 * navegador rechaza el módulo por venir con MIME text/html. El error aparece
 * recién al navegar, que es cuando se pide el chunk — de ahí que salte sobre
 * todo al iniciar sesión, que es cuando se monta la primera ruta perezosa.
 *
 * Recargar resuelve el caso: trae el index.html nuevo, con los hashes actuales.
 * La bandera en sessionStorage evita el bucle infinito si al recargar vuelve a
 * fallar, porque entonces la causa es otra y hay que dejar que el error salga.
 */
export function lazyWithReload<T extends ComponentType<never>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await factory();
      safeSession((s) => s.removeItem(RELOAD_FLAG));
      return module;
    } catch (error) {
      if (alreadyReloaded()) throw error;

      safeSession((s) => s.setItem(RELOAD_FLAG, "1"));
      window.location.reload();

      // La promesa no se resuelve nunca: la página se está recargando y React
      // no debe renderizar el fallback de error mientras tanto.
      return new Promise<{ default: T }>(() => {});
    }
  });
}
