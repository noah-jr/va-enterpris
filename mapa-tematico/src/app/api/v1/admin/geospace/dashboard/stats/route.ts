import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'success',
        object: { // axios interceptor expects this if property "object" exists or we mapped it in axios interceptor to return full response
            emergencies: {
                total: 2450,
                active: 12,
                resolved: 2400,
                falseAlarms: 38,
                last24h: 85,
                last7days: 520,
                last30days: 2100,
                avgResolutionTime: 14.5
            },
            users: {
                total: 15400,
                active: 12100
            },
            drivers: {
                total: 850,
                online: 324
            },
            trips: {
                total: 45000,
                active: 145
            },
            finance: {
                totalRevenue: 1540000,
                revenueLast24h: 12400
            }
        }
    });
}
