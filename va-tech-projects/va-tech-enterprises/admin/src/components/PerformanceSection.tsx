"use client";

import { motion } from "framer-motion";

export default function PerformanceSection() {
    return (
        <section className="pb-0 bg-background overflow-hidden relative min-h-screen flex items-center">
            <div className="tesla-container px-6 h-full">
                <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="order-2 md:order-1 relative z-20 py-24" // Increased z-index
                    >
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-8">
                            Liderança e<br />Performance
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-lg">
                            Focados em resultados mensuráveis. A nossa abordagem combina visão estratégica com execução técnica de excelência.
                        </p>

                        <div className="grid grid-cols-2 gap-12">
                            <div>
                                <h4 className="text-5xl font-bold mb-2">98%</h4>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider">Satisfação</p>
                            </div>
                            <div>
                                <h4 className="text-5xl font-bold mb-2">24h</h4>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider">Suporte</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Image & Effects Container
                        Using flex items-center justify-center to force valid centering on all viewports 
                    */}
                    <div className="order-1 md:order-2 relative h-[50vh] md:h-screen w-full flex items-center justify-center">

                        {/* Wrapper for Image and Effects to ensure they are locked together */}
                        <div className="relative flex items-center justify-center">

                            {/* Animated Tech Circles Effect - Centered Absolute */}
                            <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
                                {/* Circle 1 */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-[300px] h-[300px] md:w-[700px] md:h-[700px] border border-border/30 rounded-full absolute dashed-circle"
                                />
                                {/* Circle 2 */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="w-[220px] h-[220px] md:w-[500px] md:h-[500px] border border-border/40 rounded-full absolute"
                                />
                                {/* Circle 3 - Pulse */}
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-[150px] h-[150px] md:w-[350px] md:h-[350px] bg-secondary/20 rounded-full absolute blur-3xl"
                                />
                            </div>

                            {/* CEO Image - Centered Relative 
                                Removing manual offsets and relying on Flexbox centering 
                            */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10 h-[50vh] md:h-[85vh] w-auto max-w-none flex items-center justify-center p-4 md:p-0"
                            >
                                <img
                                    src="/ceo-performance.png"
                                    alt="Performance e Liderança"
                                    className="h-full w-auto object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
