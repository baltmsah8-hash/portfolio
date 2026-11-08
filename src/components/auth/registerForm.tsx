"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (payload: object) => void;
  onSwitch: () => void;
  loading: boolean;
  isRtl: boolean;
}

const RegisterForm = ({ onSubmit, onSwitch, loading, isRtl }: RegisterFormProps) => {
  const t = useTranslations("Auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (name.length < 4) {
      setLocalError(isRtl ? "يجب أن يكون الاسم أكثر من 4 أحرف" : "Name must be more than 4 characters");
      return;
    }

    const phoneRegex = /^(01\d{9})|(\+[1-9]\d{1,14})$/;
    if (!phoneRegex.test(phone)) {
      setLocalError(isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number format");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    try {
      await onSubmit({ name, email, phone, password });

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

return (
  <form onSubmit={handleSubmit} className="space-y-4 pt-1">
    {localError && (
      <div className="p-2 border border-red-500/20 bg-red-500/[0.01] rounded-lg font-mono text-[10px] text-red-400 text-center">
        {`VALIDATION ERROR: ${localError}`}
      </div>
    )}

    <div className="relative z-0 w-full group">
      <User className={`absolute bottom-2.5 text-gray-500 w-3.5 h-3.5 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-2' : 'right-2'}`} />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={4}
        disabled={loading}
        placeholder=" "
        className="block py-2.5 px-2 w-full text-xs font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 autofill:shadow-[0_0_0_30px_#090d16_inset] autofill:text-fill-white [-webkit-text-fill-color:white]"
      />
      <label className={`absolute text-[11px] font-mono text-gray-500 duration-300 transform -translate-y-5 scale-75 top-2.5 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
        {t("nameLabel")}
      </label>
    </div>

    <div className="relative z-0 w-full group">
      <Mail className={`absolute bottom-2.5 text-gray-500 w-3.5 h-3.5 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-2' : 'right-2'}`} />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        placeholder=" "
        className="block py-2.5 px-2 w-full text-xs font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 autofill:shadow-[0_0_0_30px_#090d16_inset] autofill:text-fill-white [-webkit-text-fill-color:white]"
      />
      <label className={`absolute text-[11px] font-mono text-gray-500 duration-300 transform -translate-y-5 scale-75 top-2.5 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
        {t("emailLabel")}
      </label>
    </div>

    <div className="relative z-0 w-full group">
      <Phone className={`absolute bottom-2.5 text-gray-500 w-3.5 h-3.5 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-2' : 'right-2'}`} />
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        disabled={loading}
        placeholder=" "
        className="block py-2.5 px-2 w-full text-xs font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 autofill:shadow-[0_0_0_30px_#090d16_inset] autofill:text-fill-white [-webkit-text-fill-color:white]"
      />
      <label className={`absolute text-[11px] font-mono text-gray-500 duration-300 transform -translate-y-5 scale-75 top-2.5 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
        {t("phoneLabel")}
      </label>
    </div>

    <div className="relative z-0 w-full group">
      <Lock className={`absolute bottom-2.5 text-gray-500 w-3.5 h-3.5 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-9' : 'right-9'}`} />
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        disabled={loading}
        placeholder=" "
        className="block py-2.5 px-2 w-full text-xs font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 autofill:shadow-[0_0_0_30px_#090d16_inset] autofill:text-fill-white [-webkit-text-fill-color:white]"
      />
      <label className={`absolute text-[11px] font-mono text-gray-500 duration-300 transform -translate-y-5 scale-75 top-2.5 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
        {t("passwordLabel")}
      </label>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={`absolute bottom-2.5 text-gray-500 hover:text-gray-300 transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
      >
        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>

    <div className="relative z-0 w-full group">
      <Lock className={`absolute bottom-2.5 text-gray-500 w-3.5 h-3.5 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-9' : 'right-9'}`} />
      <input
        type={showConfPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
        disabled={loading}
        placeholder=" "
        className="block py-2.5 px-2 w-full text-xs font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 autofill:shadow-[0_0_0_30px_#090d16_inset] autofill:text-fill-white [-webkit-text-fill-color:white]"
      />
      <label className={`absolute text-[11px] font-mono text-gray-500 duration-300 transform -translate-y-5 scale-75 top-2.5 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
        {t("confirmPasswordLabel")}
      </label>
      <button
        type="button"
        onClick={() => setShowConfPassword(!showConfPassword)}
        className={`absolute bottom-2.5 text-gray-500 hover:text-gray-300 transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
      >
        {showConfPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>

    <div className="pt-2 space-y-3">
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 text-xs font-mono rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 hover:border-green-500/30 text-green-400 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50"
      >
        <span>{loading ? t("loadingStatus") : t("signUpBtn")}</span>
        {!loading && <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />}
      </button>

      <div className="text-center font-mono text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
        <span>{t("alreadyHaveAccount")}</span>
        <button type="button" onClick={onSwitch} className="text-green-400/80 hover:text-green-400 hover:underline focus:outline-none">
          {t("switchToSignIn")}
        </button>
      </div>
    </div>
  </form>
);
}

export default RegisterForm;