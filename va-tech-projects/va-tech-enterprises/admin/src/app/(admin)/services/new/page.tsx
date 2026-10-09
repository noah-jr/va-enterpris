import ServiceForm from "@/components/ServiceForm";

export default function NewServicePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Serviço</h1>
                <p className="text-muted-foreground">Adicione um novo serviço ao portfólio.</p>
            </div>
            <ServiceForm />
        </div>
    );
}
