"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  onSubmit: (payload: object) => void;
  onSwitch: () => void;
  loading: boolean;
  isRtl: boolean;
}

const LoginForm = ({ onSubmit, onSwitch, loading, isRtl }: LoginFormProps) => {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await onSubmit({ email, password });

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const autofillClasses = "autofill:shadow-[0_0_0_30px_rgb(15,23,42)_inset] autofill:text-fill-white [-webkit-text-fill-color:white]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 flex flex-col justify-between h-full">
      <div className="relative z-0 w-full group">
        <Mail className={`absolute bottom-3 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-2' : 'right-2'}`} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder=" "
          className={`block py-3 px-2 w-full text-sm font-mono bg-transparent text-white border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 ${autofillClasses}`}
        />
        <label className={`absolute text-xs font-mono text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
          {t("emailLabel")}
        </label>
      </div>

      <div className="relative z-0 w-full group">
        <Lock className={`absolute bottom-3 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-green-500 ${isRtl ? 'left-9' : 'right-9'}`} />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={loading}
          placeholder=" "
          className={`block py-3 px-2 w-full text-sm font-mono text-white bg-transparent border-0 border-b-2 border-gray-800 appearance-none focus:outline-none focus:ring-0 focus:border-green-500 transition-colors peer disabled:opacity-50 ${autofillClasses}`}
        />
        <label className={`absolute text-xs font-mono text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-green-500 ${isRtl ? 'right-2' : 'left-2'}`}>
          {t("passwordLabel")}
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute bottom-3 text-gray-500 hover:text-gray-300 transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="pt-4 space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-xs font-mono rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 hover:border-green-500/30 text-green-400 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <span>{loading ? t("loadingStatus") : t("signInBtn")}</span>
          {!loading && <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />}
        </button>

        <div className="text-center font-mono text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <span>{t("dontHaveAccount")}</span>
          <button type="button" onClick={onSwitch} className="text-green-400/80 hover:text-green-400 hover:underline focus:outline-none">
            {t("switchToSignUp")}
          </button>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;