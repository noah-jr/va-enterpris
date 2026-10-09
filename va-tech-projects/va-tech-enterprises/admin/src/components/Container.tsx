import { cn } from "@/lib/utils";

export function Container({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className={cn("mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8", className)} {...props}>
            {children}
        </div>
    );
}
