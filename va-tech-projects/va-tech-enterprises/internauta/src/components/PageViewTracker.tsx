"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/actions/analytics";

interface PageViewTrackerProps {
    page: string;
    pageType: string;
    pageId?: string;
}

export default function PageViewTracker({ page, pageType, pageId }: PageViewTrackerProps) {
    useEffect(() => {
        // Track page view on component mount
        trackPageView(page, pageType, pageId);
    }, [page, pageType, pageId]);

    return null; // This component doesn't render anything
}
