import { PrismaPostRepository } from "@/core/infrastructure/repositories/PrismaPostRepository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, FileText } from "lucide-react";
import { deletePostAction } from "@/lib/actions/posts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const dynamic = 'force-dynamic';


import AdminFilter from "@/components/AdminFilter";
import AdminPagination from "@/components/AdminPagination";

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
    const params = await searchParams;
    const q = params?.q || "";
    const status = params?.status || "";
    const page = Number(params?.page) || 1;
    const itemsPerPage = 8;

    const repo = new PrismaPostRepository();
    const posts = await repo.findAll({
        search: q,
        status: status,
        page: page,
        limit: itemsPerPage
    });

    const totalCount = await repo.count({ search: q, status: status });
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground dark:text-white">Blog & Notícias</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie artigos e publicações.</p>
                </div>
                <Link href="/posts/new">
                    <Button className="bg-foreground hover:bg-foreground/90 text-white rounded-xl px-6">
                        <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                    </Button>
                </Link>
            </div>

            <div className="flex justify-end items-center bg-white dark:bg-card p-4 rounded-[20px] shadow-sm">
                <AdminFilter
                    label="Status"
                    paramName="status"
                    options={[
                        { label: 'Publicado', value: 'published' },
                        { label: 'Rascunho', value: 'draft' }
                    ]}
                />
            </div>

            <div className="!border-none !bg-white dark:!bg-[#1a1a1a] shadow-sm rounded-[20px] dark:shadow-none overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground dark:text-white mb-4">
                        Lista de Artigos
                        <span className="ml-2 text-sm font-normal text-gray-500">({totalCount} encontrados)</span>
                    </h2>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 dark:bg-white/5 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-l-lg w-[50px]"></th>
                                    <th className="px-4 py-3 font-medium">Título</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Data</th>
                                    <th className="px-4 py-3 font-medium text-right rounded-r-lg">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 dark:bg-foreground/10 text-foreground">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground dark:text-white">{post.title}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{post.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {post.published ? (
                                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-500">
                                                    Publicado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-bold text-yellow-500">
                                                    Rascunho
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                                            {format(new Date(post.createdAt), "dd 'de' MMM, yyyy", { locale: pt })}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/posts/${post.id}/edit`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-foreground dark:text-gray-400 dark:hover:text-white" title="Editar">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <form action={deletePostAction.bind(null, post.id)}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 hover:text-red-600" title="Apagar">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Nenhum artigo encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <AdminPagination totalPages={totalPages} />
                </div>
            </div>
        </div>
    );
}
