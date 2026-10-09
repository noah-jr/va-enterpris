import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AdminClientLayout from "@/components/AdminClientLayout";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        redirect("/login?error=SessionExpired");
    }

    const payload = await verifyToken(token);

    if (!payload) {
        redirect("/login?error=SessionExpired");
    }

    return (
        <AdminClientLayout userRole={payload.role as string}>
            {children}
        </AdminClientLayout>
    );
}
