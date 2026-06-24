import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, MapPin, Phone, User, Sparkles, ArrowRight, Check, X, Calendar } from "lucide-react";
import { useAuth, type User as AuthUser } from "../../context/AuthContext";
import { useApiFetch } from "../../lib/api";

const ONBOARDING_KEY = "onboarding_completed";

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export function needsOnboarding(userId: string | undefined): boolean {
  if (!userId) return false;
  return !localStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
}

// El onboarding solo tiene sentido si falta alguno de los datos que pide
export function hasIncompleteProfile(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return !user.bio?.trim() || !user.city?.trim() || !user.gender?.trim() || !user.phone?.trim() || !user.birthdate?.trim();
}

export function markOnboardingDoneForUser(userId: string) {
  localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, "1");
}

interface OnboardingModalProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 3;

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { user, updateUser } = useAuth();
  const api = useApiFetch();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form fields
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState(user?.bio || "");
  const [city, setCity] = useState(user?.city || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthdate, setBirthdate] = useState(user?.birthdate || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 300;
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setAvatar(dataUrl);

        api<{ url: string }>("/api/auth/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        })
          .then(({ data }) => { if (data.url) setUploadedAvatarUrl(data.url); })
          .catch(console.error)
          .finally(() => setIsUploadingImage(false));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndComplete = async () => {
    setIsSaving(true);
    try {
      const { data } = await api<{ user: typeof user }>("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name,
          avatar: uploadedAvatarUrl ?? avatar,
          bio,
          gender,
          city,
          phone,
          birthdate,
        }),
      });
      if (data.user) updateUser(data.user as NonNullable<typeof user>);
    } catch (err) {
      console.error("[Onboarding] save error:", err);
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert("No se pudieron guardar tus datos: " + message + ". Puedes volver a intentarlo desde tu perfil.");
    } finally {
      setIsSaving(false);
      onComplete();
    }
  };

  const handleSkip = () => onComplete();

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as 1 | 2 | 3);
    else handleSaveAndComplete();
  };

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
            animate={{ width: `${progressPct === 0 ? 5 : progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Skip button */}
        {step < TOTAL_STEPS && (
          <button
            onClick={handleSkip}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
            title="Saltar onboarding"
          >
            <X size={20} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* ─── PASO 1: Bienvenida + Foto ─── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="p-8 md:p-10 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                <Sparkles size={12} /> Bienvenido
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                ¡Hola, {user?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-slate-500 font-medium mb-8">
                Eres parte de El Club de Nice. Cuéntanos un poco sobre ti para personalizar tu experiencia.
              </p>

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-violet-100 bg-slate-100 shadow-md">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {isUploadingImage ? "Subiendo foto..." : "Toca el icono para subir tu foto (opcional)"}
                </p>
              </div>

              <button
                onClick={goNext}
                className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all active:scale-[0.98]"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ─── PASO 2: Datos del perfil ─── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="p-8 md:p-10"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-1">Tu perfil</h2>
              <p className="text-slate-500 font-medium text-sm mb-6">Todo es opcional. Puedes editarlo después.</p>

              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Ej. Emprendedor digital, fanático del ecommerce..."
                    className="w-full mt-1 bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium outline-none resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Ciudad */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                      <MapPin size={10} /> Ciudad
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Caracas"
                      className="w-full mt-1 bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Género */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                      <User size={10} /> Género
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">No especificado</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                      <Phone size={10} /> Teléfono
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +58 412 000 0000"
                      className="w-full mt-1 bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                      <Calendar size={10} /> Nacimiento
                    </label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={goNext}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all active:scale-[0.98]"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ─── PASO 3: ¡Todo listo! ─── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="p-8 md:p-10 text-center"
            >
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-200"
              >
                <Check className="text-white" size={44} strokeWidth={3} />
              </motion.div>

              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-3">
                ¡Ya eres parte de<br />El Club de Nice! 🚀
              </h2>
              <p className="text-slate-500 font-medium mb-2 max-w-sm mx-auto">
                Tu perfil está listo. Ahora puedes explorar la comunidad, ver el contenido y conectar con otros emprendedores.
              </p>

              {/* Checklist */}
              <div className="mt-6 mb-8 text-left space-y-2.5 bg-slate-50 rounded-2xl p-4">
                {[
                  "Accede al Muro de la comunidad",
                  "Explora el contenido y cursos",
                  "Conecta con otros miembros",
                  "Participa en los Lives",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-violet-600" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} /> Entrar a la comunidad
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === n ? "w-6 bg-violet-500" : step > n ? "w-3 bg-violet-200" : "w-3 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
