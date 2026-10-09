import PostForm from "@/components/PostForm";

export default function NewPostPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Artigo</h1>
                <p className="text-muted-foreground">Escreva e publique um novo artigo no blog.</p>
            </div>
            <PostForm />
        </div>
    );
}
