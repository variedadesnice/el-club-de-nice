import React from "react";

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

/**
 * Un chunk que no carga casi siempre significa que se publicó una versión nueva
 * y esta pestaña quedó con el index.html viejo. lazyWithReload ya intentó
 * recargar una vez; si el error llega hasta acá es que reintentar no alcanzó,
 * así que conviene decirlo con claridad en vez de hablar de un fallo genérico.
 */
function looksLikeChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(message);
}

/**
 * Red de seguridad de último nivel: sin esto, cualquier excepción no manejada
 * en el árbol de React deja la pantalla completamente en blanco (React
 * desmonta todo al fallar el render) sin ninguna forma de recuperarse.
 */
export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, isChunkError: looksLikeChunkError(error) };
  }

  componentDidCatch(error: unknown) {
    console.error("[AppErrorBoundary] uncaught render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white">
          <div>
            <p className={`text-slate-900 font-bold ${this.state.isChunkError ? "mb-2" : "mb-4"}`}>
              {this.state.isChunkError
                ? "Hay una versión nueva de la app."
                : "Algo salió mal cargando la app."}
            </p>
            {this.state.isChunkError && (
              <p className="text-slate-500 text-sm font-medium mb-4">
                Recargá la página para cargarla.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
