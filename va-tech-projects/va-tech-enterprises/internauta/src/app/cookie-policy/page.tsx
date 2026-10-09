
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
    return (
        <>
            <Header />
            <Container className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
                <FadeIn>
                    <header className="max-w-2xl">
                        <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                            Política de Cookies
                        </h1>
                        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400">
                            Última atualização: 30 de Janeiro de 2026
                        </p>
                    </header>

                    <div className="mt-16 sm:mt-20 max-w-4xl prose dark:prose-invert">
                        <p>
                            Esta Política de Cookies explica o que são cookies e como os utilizamos. Deve ler esta política para entender o que são cookies, como os utilizamos, os tipos de cookies que utilizamos, ou seja, as informações que recolhemos utilizando cookies e como essas informações são utilizadas e como controlar as preferências de cookies.
                        </p>

                        <h3>O que são Cookies?</h3>
                        <p>Cookies são pequenos ficheiros de texto que são utilizados para armazenar pequenas informações. Os cookies são armazenados no seu dispositivo quando o website é carregado no seu navegador. Estes cookies ajudam-nos a fazer o website funcionar corretamente, torná-lo mais seguro, proporcionar uma melhor experiência ao utilizador e entender como o website funciona e analisar o que funciona e onde precisa de melhorias.</p>

                        <h3>Como utilizamos os cookies?</h3>
                        <p>Como a maioria dos serviços online, o nosso website utiliza cookies de primeira parte e de terceiros para vários fins. Os cookies de primeira parte são maioritariamente necessários para que o website funcione da forma correta e não recolhem nenhum dos seus dados pessoalmente identificáveis.</p>
                        <p>Os cookies de terceiros utilizados nos nossos websites são utilizados principalmente para entender como o website funciona, como interage com o nosso website, manter os nossos serviços seguros, fornecer anúncios que são relevantes para si e, em tudo, proporcionar-lhe uma experiência de utilizador melhor e melhorada e ajudar a acelerar as suas futuras interações com o nosso website.</p>

                        <h3>Que tipos de cookies utilizamos?</h3>
                        <ul>
                            <li><strong>Essenciais:</strong> Alguns cookies são essenciais para que possa experimentar a funcionalidade completa do nosso site. Eles permitem-nos manter sessões de utilizador e prevenir quaisquer ameaças de segurança. Eles não recolhem nem armazenam nenhuma informação pessoal.</li>
                            <li><strong>Estatísticos:</strong> Estes cookies armazenam informações como o número de visitantes do website, o número de visitantes únicos, quais as páginas do website que foram visitadas, a origem da visita, etc. Estes dados ajudam-nos a compreender e analisar o desempenho do website e onde precisa de melhorias.</li>
                            <li><strong>Funcionais:</strong> Estes são os cookies que ajudam certas funcionalidades não essenciais no nosso website. Estas funcionalidades incluem incorporar conteúdo como vídeos ou partilhar conteúdos no website em plataformas de redes sociais.</li>
                            <li><strong>Preferências:</strong> Estes cookies ajudam-nos a armazenar as suas configurações e preferências de navegação, como preferências de idioma, para que tenha uma experiência melhor e mais eficiente em futuras visitas ao website.</li>
                        </ul>

                        <h3>Como posso controlar as preferências de cookies?</h3>
                        <p>Se decidir alterar as suas preferências mais tarde durante a sua sessão de navegação, pode clicar no separador "Política de Privacidade e Cookies" no seu ecrã. Isto irá exibir o aviso de consentimento novamente, permitindo-lhe alterar as suas preferências ou retirar o seu consentimento inteiramente.</p>
                        <p>Além disso, diferentes navegadores fornecem métodos diferentes para bloquear e apagar cookies utilizados pelos websites. Pode alterar as configurações do seu navegador para bloquear/apagar os cookies. Para saber mais sobre como gerir e apagar cookies, visite wikipedia.org, www.allaboutcookies.org.</p>
                    </div>
                </FadeIn>
            </Container>
            <Footer />
        </>
    );
}
