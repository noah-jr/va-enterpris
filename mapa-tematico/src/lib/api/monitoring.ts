import dashboardService from '@/lib/services/dashboard.service';

export interface ActivityFeedItem {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

export interface DriverLocation {
    id: string;
    driverId?: string; // Add this if backend returns it as driverId, or just stick to id
    name: string;
    latitude: number;
    longitude: number;
    status: 'ONLINE' | 'OFFLINE';
    tripId?: string;
}

export const getActivityFeed = async (): Promise<ActivityFeedItem[]> => {
    try {
        let activities = await dashboardService.getRecentActivities();

        // Handle paginated response or object wrapping
        if (activities && !Array.isArray(activities) && (activities as any).data) {
            activities = (activities as any).data;
        }

        if (!Array.isArray(activities)) {
            console.error('getActivityFeed: Expected array, got:', activities);
            return [];
        }

        return activities.map(a => ({
            id: a.id,
            type: a.type,
            message: a.title,
            timestamp: a.timestamp,
            severity: (a.severity?.toLowerCase() as any) || 'info'
        }));
    } catch (error) {
        console.error('Error fetching activity feed:', error);
        return [];
    }
};

export const getOnlineDrivers = async (): Promise<DriverLocation[]> => {
    try {
        let drivers = await dashboardService.getOnlineDrivers();

        // Handle paginated response or object wrapping
        if (drivers && !Array.isArray(drivers) && (drivers as any).data) {
            drivers = (drivers as any).data;
        }

        if (!Array.isArray(drivers)) {
            console.error('getOnlineDrivers: Expected array, got:', drivers);
            return [];
        }

        return drivers.map(d => ({
            id: d.id,
            name: d.name || d.user?.name || 'Agente Desconhecido',
            latitude: d.lastLatitude || d.latitude,
            longitude: d.lastLongitude || d.longitude,
            status: d.status || 'ONLINE',
            tripId: d.activeTripId || d.tripId
        }));
    } catch (error) {
        console.error('Error fetching online drivers:', error);
        return [];
    }
};
