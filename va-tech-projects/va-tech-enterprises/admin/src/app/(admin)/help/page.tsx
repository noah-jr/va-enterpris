import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Ajuda & Suporte</h1>
                <p className="text-muted-foreground">Encontre respostas para suas dúvidas e documentação do sistema.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Como adicionar um novo usuário?</AccordionTrigger>
                            <AccordionContent>
                                Vá para o menu <strong>Usuários</strong> na barra lateral e clique em "Novo Usuário" no canto superior direito. Preencha os dados necessários e clique em Salvar.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Como fazer backup dos dados?</AccordionTrigger>
                            <AccordionContent>
                                Acesse <strong>Configurações &gt; Backups</strong> (ou clique em Backups na barra lateral). Selecione o tipo de backup desejado (SQL, CSV ou Arquivos) e clique no botão de download.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Como editar o conteúdo do site?</AccordionTrigger>
                            <AccordionContent>
                                Utilize os menus "Paginas", "Artigos" ou "Serviços" para gerenciar o conteúdo exibido no site público. As alterações são refletidas imediatamente após salvar.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Como recuperar minha senha?</AccordionTrigger>
                            <AccordionContent>
                                Caso tenha esquecido sua senha, na tela de login utilize a opção "Esqueci minha senha" ou entre em contato com outro administrador do sistema para redefinir suas credenciais.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
