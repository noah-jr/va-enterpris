
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Accessibility() {
    return (
        <>
            <Header />
            <Container className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
                <FadeIn>
                    <header className="max-w-2xl">
                        <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                            Declaração de Acessibilidade
                        </h1>
                        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400">
                            Comprometidos com a inclusão digital para todos.
                        </p>
                    </header>

                    <div className="mt-16 sm:mt-20 max-w-4xl prose dark:prose-invert">
                        <p>
                            A VA Tech está empenhada em garantir a acessibilidade digital para pessoas com deficiência. Estamos continuamente a melhorar a experiência do utilizador para todos e a aplicar as normas de acessibilidade relevantes.
                        </p>

                        <h3>Esforços para apoiar a acessibilidade</h3>
                        <p>A VA Tech toma as seguintes medidas para garantir a acessibilidade do nosso website:</p>
                        <ul>
                            <li>Incluir a acessibilidade como parte da nossa declaração de missão interna.</li>
                            <li>Integrar a acessibilidade nas nossas práticas de aquisição.</li>
                            <li>Nomear um responsável pela acessibilidade e/ou provedor.</li>
                            <li>Fornecer formação contínua em acessibilidade para a nossa equipa.</li>
                        </ul>

                        <h3>Estado de Conformidade</h3>
                        <p>As Diretrizes de Acessibilidade para Conteúdo Web (WCAG) definem requisitos para designers e programadores para melhorar a acessibilidade para pessoas com deficiência. Define três níveis de conformidade: Nível A, Nível AA e Nível AAA. O website da VA Tech está parcialmente em conformidade com as WCAG 2.1 nível AA. Parcialmente em conformidade significa que algumas partes do conteúdo não estão totalmente em conformidade com o padrão de acessibilidade.</p>

                        <h3>Medidas Técnicas</h3>
                        <p>Utilizamos tecnologias modernas como HTML5 semântico, ARIA roles e atributos, e CSS responsivo para garantir que o nosso site seja compatível com tecnologias de assistência, como leitores de ecrã e software de reconhecimento de voz.</p>
                        <ul>
                            <li><strong>Contraste de Cores:</strong> Esforçamo-nos para manter um rácio de contraste adequado entre o texto e o fundo.</li>
                            <li><strong>Navegação por Teclado:</strong> O nosso site foi desenhado para ser navegável utilizando apenas o teclado.</li>
                            <li><strong>Texto Alternativo:</strong> As imagens significativas incluem texto alternativo descritivo.</li>
                        </ul>

                        <h3>Feedback</h3>
                        <p>Acolhemos o seu feedback sobre a acessibilidade do website da VA Tech. Por favor, informe-nos se encontrar barreiras de acessibilidade no nosso site:</p>
                        <ul>
                            <li>E-mail: acessibilidade@vatech.com</li>
                            <li>Telefone: +244 923 456 789</li>
                        </ul>
                        <p>Tentamos responder ao feedback dentro de 2 dias úteis.</p>
                    </div>
                </FadeIn>
            </Container>
            <Footer />
        </>
    );
}
