import emergencyService, { Emergency } from '@/lib/services/emergency.service';

export type { Emergency };

export const getEmergencies = async (): Promise<Emergency[]> => {
    return await emergencyService.getActive();
};
