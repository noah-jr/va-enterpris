'use client';

import React, { useEffect, useRef } from 'react';

export const RadarSweepLayer = ({ active = true }: { active?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !active) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let angle = 0;
        let animationFrameId: number;

        // Use a consistent tactical cyan for the radar sweep to avoid CSS variable parsing issues in Canvas
        const colorStr = '#00f2ff'; 
        const colorWithOpacity = (opacity: number) => `rgba(0, 242, 255, ${opacity})`;

        const render = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.max(width, height) * 0.8;

            // Draw Sweep
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            
            // Gradient for the sweep tail
            const gradient = ctx.createConicGradient(angle, centerX, centerY);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.1, colorWithOpacity(0.05));
            gradient.addColorStop(0.2, colorWithOpacity(0.2));

            ctx.fillStyle = gradient;
            ctx.arc(centerX, centerY, radius, angle - 0.5, angle);
            ctx.fill();
            ctx.restore();

            // Draw scanning line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.strokeStyle = colorStr;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            angle += 0.02; // Sweep speed
            animationFrameId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [active]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen"
        />
    );
};
