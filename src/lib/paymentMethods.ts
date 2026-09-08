import type { PaymentMethod } from "../types";

/**
 * Reglas compartidas sobre el método de pago receptor.
 *
 * El backend resuelve a qué banco nuestro entró el dinero leyendo el campo
 * cuyo `field_label` es "Banco" en la configuración del método (el mismo que
 * se le muestra al usuario en el checkout). Acá se replica esa lectura para
 * que el formulario pueda adaptarse, y las dos partes tienen que decidir
 * igual: si divergen, se le pediría un dato al usuario que el backend no usa.
 */
export function destinationBankLabel(method: PaymentMethod | null | undefined): string {
  if (!method) return "";
  const campo = method.fields.find((f) => f.field_label.trim().toLowerCase() === "banco");
  return (campo?.value ?? "").trim().toLowerCase();
}

/**
 * Binance P2P no emite número de referencia bancaria ni expone el teléfono
 * real de quien paga: lo único que identifica cada orden es el nombre del
 * remitente. Por eso el formulario le pide ese nombre en vez de tratarlo como
 * un Pago Móvil más.
 */
export function isBinanceMethod(method: PaymentMethod | null | undefined): boolean {
  if (!method) return false;
  if (destinationBankLabel(method).includes("binance")) return true;
  // Respaldo por si el método no tiene configurado el campo "Banco": el
  // nombre visible del método casi siempre lo dice.
  return method.name.trim().toLowerCase().includes("binance");
}
