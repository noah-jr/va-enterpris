
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfUse() {
    return (
        <>
            <Header />
            <Container className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
                <FadeIn>
                    <header className="max-w-2xl">
                        <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                            Termos de Uso
                        </h1>
                        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400">
                            Última atualização: 30 de Janeiro de 2026
                        </p>
                    </header>

                    <div className="mt-16 sm:mt-20 max-w-4xl prose dark:prose-invert">
                        <p>
                            Bem-vindo ao website da VA Tech. Ao aceder e utilizar este website, aceita cumprir e ficar vinculado aos seguintes termos e condições de uso. Se não concordar com alguma parte destes termos, não deverá utilizar o nosso website.
                        </p>

                        <h3>1. Uso do Website</h3>
                        <p>O conteúdo das páginas deste website é para sua informação geral e uso apenas. Está sujeito a alterações sem aviso prévio.</p>
                        <ul>
                            <li>Este website utiliza cookies para monitorizar as preferências de navegação. Se permitir a utilização de cookies, algumas informações pessoais podem ser armazenadas por nós para uso por terceiros.</li>
                            <li>Nem nós nem terceiros fornecemos qualquer garantia quanto à precisão, atualidade, desempenho, integridade ou adequação das informações e materiais encontrados ou oferecidos neste website para qualquer finalidade específica.</li>
                            <li>O uso de qualquer informação ou material neste website é inteiramente por sua conta e risco, pelo qual não seremos responsáveis.</li>
                        </ul>

                        <h3>2. Propriedade Intelectual</h3>
                        <p>Todo o conteúdo incluído neste site, como texto, gráficos, logótipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da VA Tech ou dos seus fornecedores de conteúdo e está protegido pelas leis de direitos de autor internacionais e aplicáveis.</p>

                        <h3>3. Ligações a Terceiros</h3>
                        <p>Este website pode incluir links para outros websites. Estes links são fornecidos para sua conveniência para fornecer mais informações. Eles não significam que endossamos o(s) website(s). Não temos responsabilidade pelo conteúdo do(s) website(s) vinculado(s).</p>

                        <h3>4. Limitação de Responsabilidade</h3>
                        <p>Em circunstância alguma a VA Tech, os seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes do seu acesso ou uso ou incapacidade de aceder ou usar o Serviço.</p>

                        <h3>5. Lei Aplicável</h3>
                        <p>A sua utilização deste website e qualquer disputa decorrente dessa utilização do website está sujeita às leis aplicáveis.</p>

                        <h3>6. Alterações aos Termos</h3>
                        <p>Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.</p>

                        <h3>7. Contacto</h3>
                        <p>Se tiver alguma dúvida sobre estes Termos, contacte-nos através do e-mail legal@vatech.com.</p>
                    </div>
                </FadeIn>
            </Container>
            <Footer />
        </>
    );
}
