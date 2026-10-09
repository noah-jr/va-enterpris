import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
              {/* <Header /> */}
            <main className="pt-20">
                <section className="py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl font-serif font-black text-black dark:text-white mb-8 text-center uppercase tracking-tighter">
                                Política de Privacidade & <span className="text-black italic">Termos</span>
                            </h1>
                            <div className="w-20 h-1 bg-black mx-auto mb-16" />

                            <div className="prose prose-lg dark:prose-invert max-w-none space-y-12 text-gray-600 dark:text-gray-400">
                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">1. Introdução</h2>
                                    <p className="leading-relaxed">
                                        Bem-vindo à Luclima. A sua privacidade é fundamental para nós. Esta política explica como recolhemos,
                                        utilizamos e protegemos as suas informações quando interage com o nosso portal,
                                        solicita orçamentos e subscreve os nossos serviços de manutenção.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">2. Recolha de Informação</h2>
                                    <p className="leading-relaxed">
                                        Recolhemos informações que nos fornece diretamente através dos nossos formulários de pedido de serviço,
                                        subscrição de newsletter e canais de contacto, incluindo:
                                    </p>
                                    <ul className="list-disc pl-6 mt-4 space-y-2">
                                        <li>Dados de contacto (nome, email, número de telefone).</li>
                                        <li>Preferências de serviço e localização para intervenção técnica.</li>
                                        <li>Dados anonimizados para acompanhamento do desempenho do site.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">3. Utilização de Informação</h2>
                                    <p className="leading-relaxed">
                                        A Luclima utiliza os seus dados para:
                                    </p>
                                    <ul className="list-disc pl-6 mt-4 space-y-2">
                                        <li>Prestar serviços de instalação, manutenção e higienização.</li>
                                        <li>Processar pedidos de orçamento e gestão de contas de clientes.</li>
                                        <li>Comunicar alertas de manutenção preventiva e actualizações de serviço.</li>
                                        <li>Garantir a segurança e eficiência das nossas operações técnicas.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">4. Cookies e Rastreamento</h2>
                                    <p className="leading-relaxed">
                                        Utilizamos cookies essenciais para manter a sua sessão e preferências.
                                        Os cookies analíticos ajudam-nos a compreender quais os serviços mais procurados,
                                        permitindo-nos priorizar a melhoria das nossas ofertas de climatização.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">5. Termos de Serviço</h2>
                                    <p className="leading-relaxed">
                                        Ao aceder à Luclima, concorda em respeitar os nossos direitos de propriedade intelectual.
                                        A reprodução de qualquer material técnico ou informativo sem consentimento expresso por escrito é estritamente proibida.
                                    </p>
                                </div>

                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-black dark:text-white mb-6">6. Actualizações</h2>
                                    <p className="leading-relaxed">
                                        A Luclima reserva-se o direito de actualizar esta política conforme as necessidades do negócio e regulamentações legais.
                                        Alterações importantes serão comunicadas através do nosso site.
                                    </p>
                                </div>

                                <div className="p-12 bg-gray-50 dark:bg-[#080808] rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
                                    <h3 className="font-serif text-2xl font-bold text-black dark:text-white mb-4 italic">Dúvidas sobre os nossos serviços?</h3>
                                    <p className="mb-8">
                                        Se tiver questões relativas ao tratamento de dados ou normas técnicas.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Email Geral</p>
                                            <p className="font-bold text-black dark:text-white">geral@luclima.com</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Linha de Apoio</p>
                                            <p className="font-bold text-black dark:text-white">+244 9XX XXX XXX</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
              {/* <Footer /> */} 
        </div>
    );
}
