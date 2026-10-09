import { PrismaUserRepository } from "@/core/infrastructure/repositories/PrismaUserRepository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, User as UserIcon, LayoutGrid, Users } from "lucide-react";
import { deleteUserAction } from "@/lib/actions/users";
import { UserSectorsManager } from "@/components/UserSectorsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserQRCode } from "@/components/UserQRCode";
import { BulkQRDownload } from "@/components/BulkQRDownload";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const repo = new PrismaUserRepository();
    const users = await repo.findAll();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Utilizadores</h1>
                    <p className="text-muted-foreground">Gerencie acessos e associações por área.</p>
                </div>
                <div className="flex gap-3">
                    <BulkQRDownload users={users} />
                    <Link href="/users/new">
                        <Button className="rounded-full shadow-lg shadow-primary/20"><Plus className="mr-2 h-4 w-4" /> Novo Utilizador</Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-full border border-border/20">
                    <TabsTrigger value="list" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="h-4 w-4 mr-2" /> Lista de Utilizadores
                    </TabsTrigger>
                    <TabsTrigger value="sectors" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <LayoutGrid className="h-4 w-4 mr-2" /> Áreas & Associações
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <div className="rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm overflow-hidden">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-muted/30 border-b border-border/10">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-6 align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Utilizador</th>
                                    <th className="h-12 px-6 align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Email</th>
                                    <th className="h-12 px-6 align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Cargo</th>
                                    <th className="h-12 px-6 align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-border/10 transition-colors hover:bg-muted/20">
                                        <td className="p-4 px-6 align-middle font-medium flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm">{user.name}</span>
                                        </td>
                                        <td className="p-4 px-6 align-middle text-muted-foreground">{user.email}</td>
                                        <td className="p-4 px-6 align-middle">
                                            <span className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-2.5 py-0.5 text-xs font-medium">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 px-6 align-middle text-right">
                                            <div className="flex justify-end gap-1">
                                                <UserQRCode email={user.email} name={user.name || ""} />
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Edit className="h-3.5 w-3.5" /></Button>
                                                </Link>
                                                <form action={deleteUserAction.bind(null, user.id)}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="sectors">
                    <UserSectorsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}

