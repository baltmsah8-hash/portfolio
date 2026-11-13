"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollReveal(triggerKey: string | number | boolean = true) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isVisible) return; // إذا ظهر بالفعل، لا تعيد تشغيل المراقب أبدًا
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [triggerKey, isVisible]);

    return { ref, isVisible };
}
