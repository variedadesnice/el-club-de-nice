import React from "react";

interface State {
  hasError: boolean;
}

/**
 * Red de seguridad de último nivel: sin esto, cualquier excepción no manejada
 * en el árbol de React deja la pantalla completamente en blanco (React
 * desmonta todo al fallar el render) sin ninguna forma de recuperarse.
 */
export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[AppErrorBoundary] uncaught render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white">
          <div>
            <p className="text-slate-900 font-bold mb-4">Algo salió mal cargando la app.</p>
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
