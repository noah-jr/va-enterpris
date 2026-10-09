'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    href?: string;
}

export function Logo({ className = '', href = '/' }: LogoProps) {
    return (
        <Link href={href} className={`flex items-center ${className}`}>
            <div className="relative w-20 h-20 md:w-24 md:h-24">
                <Image
                    src="/images/logo.png"
                    alt="Luclima Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </Link>
    );
}
