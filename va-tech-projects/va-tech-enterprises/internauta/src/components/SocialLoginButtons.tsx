"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Chrome, Facebook, Linkedin } from "lucide-react";

export default function SocialLoginButtons() {
    const handleSocialLogin = (provider: string) => {
        // Prepare for key only - means logic is here but keys might be missing
        // Verify env vars
        const hasKey =
            provider === 'google' ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID :
                provider === 'facebook' ? process.env.NEXT_PUBLIC_FACEBOOK_APP_ID :
                    process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;

        if (!hasKey) {
            toast.error(`Integração com ${provider} em preparação (Chave não configurada).`);
            return;
        }

        // Redirect to API route which handles the redirection to provider
        window.location.href = `/api/auth/${provider}`;
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all"
            >
                <Chrome className="w-5 h-5" />
                <span className="sr-only">Google</span>
            </Button>
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all"
            >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="sr-only">Facebook</span>
            </Button>
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('linkedin')}
                className="h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all"
            >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span className="sr-only">LinkedIn</span>
            </Button>
        </div>
    );
}
