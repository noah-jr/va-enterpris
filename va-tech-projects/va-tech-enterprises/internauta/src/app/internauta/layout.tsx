import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import InternautaClientLayout from "@/components/internauta/InternautaClientLayout";

export default async function InternautaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session || session.user.role !== 'INTERNAUTA') {
        redirect('/login-internauta');
    }

    return (
        <InternautaClientLayout>
            {children}
        </InternautaClientLayout>
    );
}
