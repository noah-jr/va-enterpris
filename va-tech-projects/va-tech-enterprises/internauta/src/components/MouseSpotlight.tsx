"use client";
import { useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function MouseSpotlight() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const mouseX = useMotionValue(-100); // Começa fora da tela
    const mouseY = useMotionValue(-100);

    // Física de mola para movimento fluido, orgânico e moderno (efeito "atraso elástico")
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            // Ajustar coordenadas para centralizar o spotlight no cursor
            // Tamanho do elemento é 400px, então offset é 200px
            mouseX.set(e.clientX - 200);
            mouseY.set(e.clientY - 200);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    // Renderizar apenas em telas maiores para performance em mobile
    // Usando classe hidden md:block do Tailwind (precisa estar no CSS global ou ser suportada)
    // Como é motion style, melhor controlar display via CSS ou renderização condicional.

    return (
        <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[1] hidden md:block rounded-full"
            style={{
                x,
                y,
                width: 400,
                height: 400,
                // Gradiente moderno com cores "Tech" (Ciano e Roxo) para o Dark Mode
                // Light mode usa um azul sutil
                background: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    ? "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(139, 92, 246, 0.10) 45%, transparent 70%)"
                    : "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 60%)",
                filter: "blur(50px)", // Blur intenso para suavidade premium
                mixBlendMode: "normal", // Compatibilidade melhor que screen/overlay em alguns monitores
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        />
    );
}
