
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <>
            <Header />
            <Container className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
                <FadeIn>
                    <header className="max-w-2xl">
                        <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                            Política de Privacidade
                        </h1>
                        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400">
                            Última atualização: 30 de Janeiro de 2026
                        </p>
                    </header>

                    <div className="mt-16 sm:mt-20 max-w-4xl prose dark:prose-invert">
                        <p>
                            A VA Tech ("nós", "nosso" ou "empresa") está comprometida em proteger a sua privacidade e os seus dados pessoais. Esta Política de Privacidade explica como recolhemos, utilizamos, partilhamos e protegemos as suas informações quando utiliza o nosso website e serviços.
                        </p>

                        <h3>1. Informações que Recolhemos</h3>
                        <p>Podemos recolher os seguintes tipos de informações:</p>
                        <ul>
                            <li><strong>Informações Pessoais:</strong> Nome, endereço de e-mail, número de telefone e outras informações de contacto que nos fornece voluntariamente ao preencher formulários ou contactar-nos.</li>
                            <li><strong>Dados de Utilização:</strong> Informações sobre como acede e utiliza o nosso website, incluindo endereço IP, tipo de navegador, páginas visitadas e tempo de permanência.</li>
                            <li><strong>Cookies e Tecnologias Semelhantes:</strong> Utilizamos cookies para melhorar a sua experiência de navegação e analisar o tráfego do site. Consulte nossa Política de Cookies para mais detalhes.</li>
                        </ul>

                        <h3>2. Como Utilizamos as Suas Informações</h3>
                        <p>Utilizamos as informações recolhidas para:</p>
                        <ul>
                            <li>Fornecer, operar e manter o nosso website e serviços;</li>
                            <li>Melhorar, personalizar e expandir os nossos serviços;</li>
                            <li>Entender e analisar como utiliza o nosso website;</li>
                            <li>Desenvolver novos produtos, serviços, funcionalidades e funcionalidades;</li>
                            <li>Comunicar consigo, diretamente ou através de um dos nossos parceiros, incluindo para atendimento ao cliente, para lhe fornecer atualizações e outras informações relacionadas com o website, e para fins de marketing e promoção;</li>
                            <li>Enviar-lhe e-mails;</li>
                            <li>Encontrar e prevenir fraudes.</li>
                        </ul>

                        <h3>3. Partilha de Informações</h3>
                        <p>Não vendemos, trocamos ou transferimos as suas informações pessoais para terceiros sem o seu consentimento, exceto nas seguintes circunstâncias:</p>
                        <ul>
                            <li><strong>Prestadores de Serviços:</strong> Podemos partilhar informações com fornecedores terceiros que nos ajudam a operar o nosso negócio (ex: alojamento web, análise de dados).</li>
                            <li><strong>Obrigações Legais:</strong> Podemos divulgar as suas informações se exigido por lei ou em resposta a pedidos válidos de autoridades públicas.</li>
                        </ul>

                        <h3>4. Segurança dos Dados</h3>
                        <p>Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger as suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrónico é 100% seguro.</p>

                        <h3>5. Os Seus Direitos</h3>
                        <p>Dependendo da sua localização, pode ter direitos relacionados com os seus dados pessoais, incluindo:</p>
                        <ul>
                            <li>O direito de aceder, atualizar ou apagar as informações que temos sobre si;</li>
                            <li>O direito de retificação;</li>
                            <li>O direito de oposição;</li>
                            <li>O direito de restrição;</li>
                            <li>O direito à portabilidade dos dados;</li>
                            <li>O direito de retirar o consentimento.</li>
                        </ul>

                        <h3>6. Links para Outros Sites</h3>
                        <p>O nosso serviço pode conter links para outros sites que não são operados por nós. Se clicar num link de terceiros, será direcionado para o site desse terceiro. Recomendamos vivamente que reveja a Política de Privacidade de cada site que visita.</p>

                        <h3>7. Alterações a Esta Política de Privacidade</h3>
                        <p>Podemos atualizar a nossa Política de Privacidade periodicamente. Iremos notificá-lo de quaisquer alterações publicando a nova Política de Privacidade nesta página.</p>

                        <h3>8. Contacte-nos</h3>
                        <p>Se tiver alguma dúvida sobre esta Política de Privacidade, pode contactar-nos:</p>
                        <ul>
                            <li>Por e-mail: Geral@vatech.pt</li>
                            <li>Através da nossa página de contacto no website.</li>
                        </ul>
                    </div>
                </FadeIn>
            </Container>
            <Footer />
        </>
    );
}

