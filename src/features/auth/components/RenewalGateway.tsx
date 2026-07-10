import React, { useEffect, useState } from "react";
import {
  Mail, Clock, ShieldOff, CreditCard, Upload, FileText, CheckCircle2, ChevronLeft, ChevronRight, Hash, Phone, LogOut, RefreshCw, AlertTriangle, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, User } from "../../../context/AuthContext";
import { useApiFetch } from "../../../lib/api";
import type { PaymentMethod, PlanType, Currency, Payment } from "../../../types";

const PLAN_OPTIONS: { value: PlanType; label: string; sublabel: string; price: string }[] = [
  { value: "1m", label: "1 mes", sublabel: "Acceso mensual", price: "25" },
  { value: "1y", label: "1 año", sublabel: "Plan anual", price: "197" },
];

const COUNTRY_CODES = [
  { flag: "🇻🇪", code: "+58",  name: "Venezuela",      digits: 10 },
  { flag: "🇺🇸", code: "+1",   name: "EE.UU.",         digits: 10 },
  { flag: "🇲🇽", code: "+52",  name: "México",         digits: 10 },
  { flag: "🇨🇴", code: "+57",  name: "Colombia",       digits: 10 },
  { flag: "🇦🇷", code: "+54",  name: "Argentina",      digits: 10 },
  { flag: "🇵🇪", code: "+51",  name: "Perú",           digits: 9  },
  { flag: "🇨🇱", code: "+56",  name: "Chile",          digits: 9  },
  { flag: "🇪🇸", code: "+34",  name: "España",         digits: 9  },
  { flag: "🇵🇦", code: "+507", name: "Panamá",         digits: 8  },
  { flag: "🇩🇴", code: "+1",   name: "Rep. Dominicana",digits: 10 },
];

const VENEZUELAN_BANKS = [
  { code: "0102", name: "Banco de Venezuela" },
  { code: "0134", name: "Banesco" },
  { code: "0105", name: "Mercantil" },
  { code: "0108", name: "Provincial" },
  { code: "0172", name: "Bancamiga" },
  { code: "0114", name: "Bancaribe" },
  { code: "0115", name: "Banco Exterior" },
  { code: "0128", name: "Banco Caroní" },
  { code: "0151", name: "BFC Banco Fondo Común" },
  { code: "0163", name: "100% Banco" },
  { code: "0168", name: "Bancrecer" },
  { code: "0171", name: "Banco Activo" },
  { code: "0174", name: "Banplus" },
  { code: "0175", name: "Banco Bicentenario" },
  { code: "0177", name: "BANFANB" },
  { code: "0191", name: "Banco Nacional de Crédito BNC" },
];

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024; // 5MB

type Step = 1 | 2;

const inputClass =
  "w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all outline-none";
const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1";

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl"
    >
      {message}
    </motion.p>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
    >
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-black text-slate-800 mt-0.5">{value}</p>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-600"
          : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
      }`}>
        {copied ? "✓ Copiado" : "Copiar"}
      </span>
    </button>
  );
}

export default function RenewalGateway({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const { user, logout, updateUser } = useAuth();
  const api = useApiFetch();

  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Form states
  const [plan, setPlan] = useState<PlanType>("1m");
  const [amount, setAmount] = useState("25");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+58");
  const [phone, setPhone] = useState("");

  // Pago Móvil automatic verification states
  const [payerBank, setPayerBank] = useState("");
  const [payerIdType, setPayerIdType] = useState("V");
  const [payerIdNumber, setPayerIdNumber] = useState("");
  const [isAutoApproved, setIsAutoApproved] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState<string | null>(null);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState("");

  // Receipt upload
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptPath, setReceiptPath] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId) ?? null;

  // Tasas BCV
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [bcvLoading, setBcvLoading] = useState(true);

  useEffect(() => {
    fetch("https://ve.dolarapi.com/v1/dolares/oficial")
      .then((r) => r.json())
      .then((data) => {
        if (data?.promedio) {
          setBcvRate(data.promedio);
          setAmount((25 * data.promedio).toFixed(2));
        }
      })
      .catch(() => {})
      .finally(() => setBcvLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<PaymentMethod[]>("/api/payment-methods/")
      .then(({ data }) => {
        if (cancelled) return;
        setPaymentMethods(data);
        setSelectedMethodId(data[0]?.id || "");
      })
      .catch((err) => {
        if (!cancelled) setMethodsError(err instanceof Error ? err.message : "Error al cargar métodos de pago.");
      })
      .finally(() => {
        if (!cancelled) setMethodsLoading(false);
      });

    api<Currency[]>("/api/currencies/")
      .then(({ data }) => {
        if (cancelled) return;
        setCurrencies(data);
        const ves = data.find((c) => c.code === "VES" || c.code === "Bs" || c.code === "VED");
        setSelectedCurrencyId(ves?.id ?? data[0]?.id ?? "");
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === plan);
  const bsAmount = bcvRate && selectedPlan ? (parseFloat(selectedPlan.price) * bcvRate).toFixed(2) : null;

  function handleNextStep() {
    if (!amount.trim() || !selectedMethodId || !referenceNumber.trim() || !phone.trim()) {
      setStepError("Completa todos los campos del pago para continuar.");
      return;
    }
    const isPagoMovil = selectedMethod?.name.toLowerCase().includes("móvil") || selectedMethod?.name.toLowerCase().includes("movil");
    if (isPagoMovil) {
      if (!payerBank) {
        setStepError("Selecciona el banco de origen.");
        return;
      }
      if (!payerIdNumber.trim()) {
        setStepError("Ingresa la cédula del pagador.");
        return;
      }
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setStepError("El número de teléfono debe tener entre 7 y 15 dígitos.");
      return;
    }
    setStepError(null);
    setStep(2);
  }

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_RECEIPT_SIZE) {
      setUploadError("El archivo es demasiado grande (máximo 5MB).");
      return;
    }

    setUploadError(null);
    setIsUploadingReceipt(true);
    setReceiptPath("");

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const { data } = await api<{ path: string }>("/api/payments/upload-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference_number: referenceNumber.trim(),
            filename: file.name,
            fileData: dataUrl,
          }),
        });
        setReceiptPath(data.path);
        setReceiptFileName(file.name);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Error al subir el comprobante");
      } finally {
        setIsUploadingReceipt(false);
      }
    };
    reader.onerror = () => {
      setUploadError("No se pudo leer el archivo.");
      setIsUploadingReceipt(false);
    };
    reader.readAsDataURL(file);
  }

  function clearReceipt() {
    setReceiptPath("");
    setReceiptFileName("");
    setUploadError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptPath) {
      setSubmitError("Sube tu comprobante de pago antes de finalizar.");
      return;
    }
    if (!selectedMethodId) {
      setSubmitError("Selecciona un método de pago.");
      return;
    }
    if (!selectedCurrencyId) {
      setSubmitError("No se pudo determinar la moneda. Recarga la página e intenta de nuevo.");
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const isPagoMovil = selectedMethod?.name.toLowerCase().includes("móvil") || selectedMethod?.name.toLowerCase().includes("movil");
      const resp = await api<{ payment: { status: string }; user?: User }>("/api/payments/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          amount: parseFloat(selectedPlan?.price ?? "0"),
          payment_method_id: selectedMethodId,
          reference_number: referenceNumber.trim(),
          phone: `${countryCode}${phone.trim()}`,
          receipt_path: receiptPath,
          currency_id: selectedCurrencyId,
          amount_local: Number(bsAmount ?? amount),
          exchange_rate: bcvRate ?? 1,
          banco_origen: isPagoMovil ? payerBank : null,
          cedula_pagador: isPagoMovil ? `${payerIdType}${payerIdNumber.trim()}` : null,
        }),
      });

      if (resp?.data?.payment?.status === "success") {
        setIsAutoApproved(true);
        if (resp.data.user) {
          updateUser(resp.data.user);
        }
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al registrar tu renovación. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefreshStatus() {
    setIsRefreshing(true);
    setRefreshNotice(null);
    try {
      const { data } = await api<{ user: User }>("/api/auth/me");
      updateUser(data.user);
      if (data.user.subscription_status === "active") {
        setRefreshNotice("¡Tu suscripción ya está activa! Redirigiendo...");
      } else {
        setRefreshNotice("Tu estado sigue igual. Si acabas de enviar el comprobante, espera a que el admin lo apruebe.");
      }
    } catch (err) {
      setRefreshNotice("No se pudo actualizar el estado.");
    } finally {
      setIsRefreshing(false);
    }
  }

  const successCard = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm text-center relative"
    >
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      )}
      {isAutoApproved ? (
        <>
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">¡Membresía activa!</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Tu pago de renovación ha sido verificado automáticamente con éxito. Tu acceso a la comunidad ha sido reactivado de inmediato.
          </p>
          <div className="flex justify-center">
            {isModal && onClose ? (
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                Comenzar a navegar
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                Ir al inicio
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Renovación en revisión</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Recibimos tu comprobante de renovación. Un administrador lo revisará pronto y reactivará tu acceso.
            Te avisaremos en cuanto esté validado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              Actualizar estado
            </button>
            {(!isModal || !onClose) && (
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            )}
          </div>
          {refreshNotice && (
            <p className="text-xs font-bold text-indigo-600 mt-4">{refreshNotice}</p>
          )}
        </>
      )}
    </motion.div>
  );

  if (submitted) {
    if (isModal) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          {successCard}
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-slate-50">
        {successCard}
      </div>
    );
  }

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative"
    >
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      )}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Tu membresía ha vencido</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Para continuar disfrutando de la comunidad y tus beneficios, realiza un nuevo pago y sube tu comprobante.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 1 ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
            }`}>1</span>
            <span className={`text-xs font-bold ${step === 1 ? "text-slate-900" : "text-slate-400"}`}>Plan y Pago</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-100" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>2</span>
            <span className={`text-xs font-bold ${step === 2 ? "text-slate-900" : "text-slate-400"}`}>Comprobante</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Plan Options */}
              <div className="space-y-2.5">
                <label className={labelClass}>Selecciona tu Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLAN_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setPlan(p.value);
                        const bs = bcvRate ? (parseFloat(p.price) * bcvRate).toFixed(2) : p.price;
                        setAmount(bs);
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all ${
                        plan === p.value
                          ? "border-indigo-600 bg-indigo-50/50"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <p className={`font-black text-sm ${plan === p.value ? "text-indigo-600" : "text-slate-800"}`}>{p.label}</p>
                      <p className={`font-black text-lg mt-1 ${plan === p.value ? "text-indigo-700" : "text-slate-900"}`}>
                        ${p.price} <span className="text-xs font-medium text-slate-400">USD</span>
                      </p>
                      {bcvRate && (
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">
                          Bs. {(parseFloat(p.price) * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{p.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className={labelClass}>Monto a pagar (Bs.)</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  {bcvLoading ? (
                    <div className={`${inputClass} flex items-center text-slate-400`}>
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin mr-2" />
                      Calculando tasa oficial...
                    </div>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={bsAmount ? `Bs. ${parseFloat(bsAmount).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : amount}
                      className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-600 font-bold select-none`}
                    />
                  )}
                </div>
                {bcvRate && (
                  <p className="text-[10px] text-slate-400 font-medium ml-1">
                    Tasa oficial BCV: 1 USD = Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className={labelClass}>Método de Pago</label>
                {methodsLoading ? (
                  <p className="text-sm font-medium text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">Cargando métodos...</p>
                ) : methodsError ? (
                  <FieldError message={methodsError} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${
                          selectedMethodId === m.id
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <p className={`font-black text-sm ${selectedMethodId === m.id ? "text-indigo-600" : "text-slate-800"}`}>{m.name}</p>
                        {m.description && <p className="text-[11px] font-medium text-slate-400 mt-0.5">{m.description}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer Details Card */}
              {selectedMethod && selectedMethod.fields.length > 0 && (
                <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 space-y-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CreditCard size={11} /> Datos para la transferencia
                  </p>
                  {selectedMethod.fields.map((f) => (
                    <CopyField key={f.field_key} label={f.field_label} value={f.value ?? "—"} />
                  ))}
                </div>
              )}

              {/* Campos dinámicos para verificación automática de Pago Móvil */}
              {selectedMethod && (selectedMethod.name.toLowerCase().includes("móvil") || selectedMethod.name.toLowerCase().includes("movil")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}>Banco de origen</label>
                    <select
                      value={payerBank}
                      onChange={(e) => setPayerBank(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-4 text-sm font-medium transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="">Selecciona tu banco</option>
                      {VENEZUELAN_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Cédula del pagador</label>
                    <div className="flex gap-2">
                      <select
                        value={payerIdType}
                        onChange={(e) => setPayerIdType(e.target.value)}
                        className="shrink-0 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-3 text-sm font-bold outline-none transition-all cursor-pointer"
                      >
                        <option value="V">V</option>
                        <option value="E">E</option>
                        <option value="J">J</option>
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          required
                          value={payerIdNumber}
                          onChange={(e) => setPayerIdNumber(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="Ej. 12177212"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ref & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Número de Referencia</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Ej. 0001234567" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Teléfono de Contacto</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => { setCountryCode(e.target.value); setPhone(""); }}
                      className="shrink-0 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-3 text-sm font-bold outline-none transition-all cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.name}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Número sin prefijo"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* File Uploader */}
              <div className="space-y-2">
                <label className={labelClass}>Subir Comprobante</label>
                {!receiptFileName ? (
                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-12 px-6 cursor-pointer transition-all ${
                    isUploadingReceipt ? "border-slate-200 bg-slate-50 cursor-wait" : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                  }`}>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptChange} disabled={isUploadingReceipt} />
                    {isUploadingReceipt ? (
                      <>
                        <span className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm font-bold text-slate-500">Subiendo comprobante...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                          <Upload size={22} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">Selecciona la imagen o PDF del comprobante</p>
                          <p className="text-xs font-medium text-slate-400 mt-1">Tamaño máximo 5MB</p>
                        </div>
                      </>
                    )}
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-4 border-2 border-green-100 bg-green-50 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{receiptFileName}</p>
                        <p className="text-xs font-medium text-green-600 flex items-center gap-1.5"><CheckCircle2 size={12} /> Archivo listo</p>
                      </div>
                    </div>
                    <button type="button" onClick={clearReceipt} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-white transition-all flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <FieldError message={uploadError} />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Resumen de Renovación</p>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Plan</span><span className="font-bold text-slate-700">{PLAN_OPTIONS.find((p) => p.value === plan)?.label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Monto total</span><span className="font-bold text-slate-700">Bs. {parseFloat(bsAmount ?? amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Método de pago</span><span className="font-bold text-slate-700">{selectedMethod?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Referencia</span><span className="font-bold text-slate-700">{referenceNumber}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FieldError message={stepError} />
        <FieldError message={submitError} />

        {/* Footer controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft size={18} /> Atrás
            </button>
          ) : isModal && onClose ? (
            <button type="button" onClick={onClose} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
          ) : (
            <button onClick={logout} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
              <LogOut size={18} /> Cerrar sesión
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !receiptPath}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Enviar Renovación <CheckCircle2 size={18} /></>
              )}
            </button>
          )}
        </div>
      </motion.div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          {cardContent}
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-slate-50">
        {cardContent}
      </div>
    );
}
