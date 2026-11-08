"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type AlertType = "success" | "error";

interface AlertContextType {
    showAlert: (message: string, type: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const showAlert = (message: string, type: AlertType) => {
        setAlert({ message, type });
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            {alert && (
                <div className={`fixed z-50 left-1/2 -translate-x-1/2 max-w-md w-[92%] sm:w-full px-4 py-3.5 rounded-xl border backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl transition-all duration-300
                                bottom-6 sm:bottom-auto sm:top-6
                                animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-300 ${alert.type === "success"
                        ? "bg-[#070a13]/90 border-green-500/30 shadow-green-950/20 text-white"
                        : "bg-[#0a0404]/90 border-red-500/30 shadow-red-950/20 text-white"
                    }`}>

                    <div className="absolute inset-0 rounded-xl blur-md pointer-events-none opacity-20 bg-green-500/10" />

                    <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${alert.type === "success" ? "text-green-400 bg-green-500/5" : "text-red-400 bg-red-500/5"}`}>
                            {alert.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <p className="text-[11px] sm:text-xs font-mono tracking-wide truncate-2-lines leading-relaxed">
                            <span className={alert.type === "success" ? "text-green-400" : "text-red-400"}>
                                {alert.type === "success" ? "SYSTEM: " : "ERROR: "}
                            </span>
                            {alert.message}
                        </p>
                    </div>

                    <button
                        onClick={() => setAlert(null)}
                        className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer relative z-10 flex-shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error("useAlert must be used within an AlertProvider");
    return context;
};
