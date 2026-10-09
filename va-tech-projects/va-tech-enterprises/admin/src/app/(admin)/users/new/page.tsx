import UserForm from "@/components/UserForm";

export default function NewUserPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
                <p className="text-muted-foreground">Adicione um novo administrador ou editor.</p>
            </div>
            <UserForm />
        </div>
    );
}
