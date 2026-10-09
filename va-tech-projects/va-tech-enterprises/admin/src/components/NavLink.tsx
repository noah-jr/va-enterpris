"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Support both href and to
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  to?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, href, to, ...props }, ref) => {
    const pathname = usePathname();
    const destination = href || to || "#";
    const isActive = pathname === destination || (destination !== '/' && pathname?.startsWith(destination));

    return (
      <Link
        ref={ref}
        href={destination}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  }
);
NavLink.displayName = "NavLink";

export { NavLink };
