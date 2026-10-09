
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    const validProviders = ['google', 'facebook', 'linkedin'];
    if (!validProviders.includes(provider)) {
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/${provider}/callback`;

    let authUrl = "";

    switch (provider) {
        case 'google':
            const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!googleClientId) return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 });
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
            break;

        case 'facebook':
            const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
            if (!facebookAppId) return NextResponse.json({ error: "Facebook App ID not configured" }, { status: 500 });
            authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&scope=email`;
            break;

        case 'linkedin':
            const linkedinClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
            if (!linkedinClientId) return NextResponse.json({ error: "LinkedIn Client ID not configured" }, { status: 500 });
            authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress`;
            break;
    }

    if (authUrl) {
        return NextResponse.redirect(authUrl);
    }

    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
}
