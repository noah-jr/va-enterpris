const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export const apiService = {
    async getEvents() {
        const res = await fetch(`${API_URL}/events`);
        if (!res.ok) throw new Error('Falha ao procurar eventos');
        return res.json();
    },

    async getEventById(id: string) {
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) throw new Error('Falha ao procurar detalhes do evento');
        return res.json();
    },

    async getBlogPosts() {
        const res = await fetch(`${API_URL}/blog`);
        if (!res.ok) throw new Error('Falha ao procurar blog posts');
        return res.json();
    },

    async newsletterSubscribe(email: string) {
        const res = await fetch(`${API_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error('Falha ao subscrever');
        return res.json();
    }
};
