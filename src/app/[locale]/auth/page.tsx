"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Terminal } from "lucide-react";
import LoginForm from "@/src/components/auth/loginForm";
import RegisterForm from "@/src/components/auth/registerForm";

export default function AuthPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [run, setRun] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSubmit = async (endpoint: "login" | "register", payload: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Authentication protocol failed");
      }

      if (result.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }

    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setRun(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [isLogin]);

  return (
    <main className="w-full min-h-screen bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 relative flex items-center justify-center overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`w-full max-w-md relative z-10 space-y-6 
        ${run ? "opacity-20 scale-25" : "opacity-100 scale-100"} transition-all duration-300`}>
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-green-500/5 border border-green-500/10 rounded-xl mb-2 text-green-400">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            {isLogin ? t("signInTitle") : t("signUpTitle")}
          </h1>
        </div>

        <div className="w-full max-h-[450px] border border-green-500/10 bg-[#090d16]/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative transition-all duration-500 hover:border-green-500/30 flex flex-col justify-between">
          <div className="absolute -inset-px bg-gradient-to-b from-green-500/5 to-transparent opacity-40 pointer-events-none rounded-2xl" />

          <div className="h-full scrollbar-none pr-1 pl-1">
            {error && (
              <div className="mb-4 p-2.5 border border-red-500/20 bg-red-500/[0.02] rounded-xl font-mono text-[11px] text-red-400/90 text-center">
                {`ERROR : ${error}`}
              </div>
            )}

            {isLogin ? (
              <LoginForm 
                onSubmit={(payload) => handleAuthSubmit("login", payload)} 
                onSwitch={() => { setRun(true); setIsLogin(false); setError(null); }} 
                loading={loading}
                isRtl={isRtl}
              />
            ) : (
              <RegisterForm 
                onSubmit={(payload) => handleAuthSubmit("register", payload)} 
                onSwitch={() => { setRun(true); setIsLogin(true); setError(null); }} 
                loading={loading}
                isRtl={isRtl}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
