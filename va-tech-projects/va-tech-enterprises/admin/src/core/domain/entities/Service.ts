export interface Service {
    id: string;
    slug: string;
    title: string;
    description: string;
    longDescription?: string | null;
    category: string;
    icon: string;
    image?: string | null;
    active: boolean;
    features: string[];
}
