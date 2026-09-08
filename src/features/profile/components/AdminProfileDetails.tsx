import React, { useEffect, useState } from "react";
import { Mail, Phone, Cake, MapPin, CalendarClock, Receipt, ShieldCheck, Copy, Check } from "lucide-react";
import { useApiFetch } from "../../../lib/api";
import type { AdminUserProfile } from "../../../types";

interface Props {
  userId: string;
}

const ESTADO_SUSCRIPCION: Record<string, { label: string; cls: string }> = {
  active: { label: "Activa", cls: "bg-green-50 text-green-700 border-green-200" },
  expired: { label: "Vencida", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  inactive: { label: "Inactiva", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const ESTADO_PAGO: Record<string, string> = {
  pending: "En revisión",
  success: "Aprobado",
  failed: "Rechazado",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

/** Una fila copiable: el admin casi siempre quiere pegar el dato en WhatsApp o en el correo. */
function Dato({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const vacio = !value;

  async function copiar() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // El portapapeles puede estar bloqueado (contexto no seguro, permisos):
      // el dato sigue visible y seleccionable, así que no se avisa nada.
    }
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon size={15} className="text-slate-400 shrink-0" />
      <span className="text-xs font-bold text-slate-400 w-28 shrink-0">{label}</span>
      {vacio ? (
        <span className="text-sm font-medium text-slate-300">Sin datos</span>
      ) : (
        <>
          {href ? (
            <a href={href} className="text-sm font-bold text-indigo-600 hover:underline truncate flex-1" target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            <span className="text-sm font-bold text-slate-700 truncate flex-1">{value}</span>
          )}
          <button
            type="button"
            onClick={copiar}
            title={`Copiar ${label.toLowerCase()}`}
            className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
          >
            {copiado ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Bloque con los datos privados de un miembro, para que un admin pueda
 * ubicarlo y contactarlo (entregar un premio de la ruleta, resolver un pago).
 *
 * Se monta sólo cuando quien mira es admin, y aun así los datos no viajan al
 * navegador hasta que este componente los pide: vienen de un endpoint aparte
 * que el backend protege con su propia comprobación de rol. Ocultar el bloque
 * en la interfaz no sería una protección, sólo una cortina.
 */
export default function AdminProfileDetails({ userId }: Props) {
  const api = useApiFetch();
  const [datos, setDatos] = useState<AdminUserProfile | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    api<AdminUserProfile>(`/api/users/${userId}/admin-profile`)
      .then(({ data }) => {
        if (!cancelado) setDatos(data);
      })
      .catch((err) => {
        if (!cancelado) setError(err instanceof Error ? err.message : "No se pudieron cargar los datos.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cargando) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5">
        <div className="h-3 w-32 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-slate-100 rounded animate-pulse mb-2" />
        <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <p className="text-xs font-bold text-red-500">{error ?? "No se pudieron cargar los datos."}</p>
      </div>
    );
  }

  const estado = ESTADO_SUSCRIPCION[datos.subscription_status ?? ""] ?? ESTADO_SUSCRIPCION.inactive;
  const telefonoLimpio = datos.phone?.replace(/[^0-9+]/g, "") ?? "";

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={12} /> Datos privados
        </p>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${estado.cls}`}>
          {estado.label}
        </span>
      </div>
      <p className="text-[11px] font-medium text-slate-400 mb-3">Sólo visible para administradores.</p>

      <div className="bg-white rounded-xl px-4 py-1">
        <Dato icon={Mail} label="Correo" value={datos.email} href={datos.email ? `mailto:${datos.email}` : undefined} />
        <Dato
          icon={Phone}
          label="Teléfono"
          value={datos.phone}
          href={telefonoLimpio ? `https://wa.me/${telefonoLimpio.replace(/^\+/, "")}` : undefined}
        />
        <Dato icon={MapPin} label="Ciudad" value={datos.city} />
        <Dato icon={Cake} label="Nacimiento" value={datos.birthdate ? formatDate(datos.birthdate) : null} />
        <Dato icon={CalendarClock} label="Miembro desde" value={datos.joined_at ? formatDate(datos.joined_at) : null} />
        <Dato
          icon={CalendarClock}
          label="Vence"
          value={datos.subscription_expires_at ? formatDate(datos.subscription_expires_at) : "Sin vencimiento"}
        />
      </div>

      {datos.last_payment && (
        <div className="bg-white rounded-xl px-4 py-3 mt-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Receipt size={12} /> Último pago
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-400">Estado</span>
            <span className="font-bold text-slate-700">
              {ESTADO_PAGO[datos.last_payment.status] ?? datos.last_payment.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="font-medium text-slate-400">Método</span>
            <span className="font-bold text-slate-700 truncate ml-3">{datos.last_payment.payment_method ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="font-medium text-slate-400">Referencia</span>
            <span className="font-bold text-slate-700 truncate ml-3">{datos.last_payment.reference_number ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="font-medium text-slate-400">Fecha</span>
            <span className="font-bold text-slate-700">{formatDate(datos.last_payment.created_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
