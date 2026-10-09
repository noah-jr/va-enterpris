import Dexie, { type Table } from 'dexie';

export interface LocalClient {
    id?: string;
    name: string;
    nif: string;
    email?: string;
    phone?: string;
    address?: string;
    synced: boolean;
}

export interface LocalProduct {
    id?: string;
    name: string;
    code: string;
    price: number;
    stock: number;
    synced: boolean;
}

export interface LocalInvoice {
    id?: string;
    number: string;
    clientName: string;
    amount: number;
    status: string;
    date: string;
    synced: boolean;
}

export interface DashboardSnapshot {
    id: string; // 'current'
    data: any;
    lastUpdated: string;
}

export class OfflineStorage extends Dexie {
    clients!: Table<LocalClient>;
    products!: Table<LocalProduct>;
    invoices!: Table<LocalInvoice>;
    stats!: Table<DashboardSnapshot>;

    constructor() {
        super('OneGest_Offline');
        this.version(1).stores({
            clients: '++id, nif, email, synced',
            products: '++id, code, synced',
            invoices: '++id, number, synced',
            stats: 'id'
        });
    }
}

export const db = new OfflineStorage();
