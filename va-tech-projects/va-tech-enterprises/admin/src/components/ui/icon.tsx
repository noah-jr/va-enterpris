import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
    name: string;
}

export const Icon = ({ name, ...props }: IconProps) => {
    const LucideIcon = (Icons as any)[name];
    if (!LucideIcon) {
        console.warn(`Icon ${name} not found`);
        return null;
    }
    return <LucideIcon {...props} />;
};
