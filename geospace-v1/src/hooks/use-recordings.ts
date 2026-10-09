"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recordingService, { type Recording, type RecordingFilters } from '@/lib/services/recording.service';
import { toast } from '@/hooks/use-toast';

// ============================================
// QUERY KEYS
// ============================================

export const recordingKeys = {
    all: ['recordings'] as const,
    lists: () => [...recordingKeys.all, 'list'] as const,
    list: (filters?: RecordingFilters) => [...recordingKeys.lists(), filters] as const,
    details: () => [...recordingKeys.all, 'detail'] as const,
    detail: (id: string) => [...recordingKeys.details(), id] as const,
    byEmergency: (emergencyId: string) => [...recordingKeys.all, 'emergency', emergencyId] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para listar gravações
 */
export function useRecordings(filters?: RecordingFilters) {
    return useQuery({
        queryKey: recordingKeys.list(filters),
        queryFn: () => recordingService.getAll(filters),
    });
}

/**
 * Hook para obter detalhes de uma gravação
 */
export function useRecording(id: string) {
    return useQuery({
        queryKey: recordingKeys.detail(id),
        queryFn: () => recordingService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook para obter gravações de uma emergência
 */
export function useEmergencyRecordings(emergencyId: string) {
    return useQuery({
        queryKey: recordingKeys.byEmergency(emergencyId),
        queryFn: () => recordingService.getByEmergency(emergencyId),
        enabled: !!emergencyId,
    });
}

/**
 * Hook para download de gravação
 */
export function useDownloadRecording() {
    return useMutation({
        mutationFn: async (id: string) => {
            const blob = await recordingService.download(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recording-${id}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            toast({
                title: 'Download Iniciado',
                description: 'O download da gravação foi iniciado.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro no Download',
                description: 'Não foi possível fazer o download da gravação.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook para atualizar transcrição
 */
export function useUpdateTranscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, transcription }: { id: string; transcription: string }) =>
            recordingService.updateTranscription(id, transcription),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: recordingKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: recordingKeys.lists() });
            toast({
                title: 'Transcrição Atualizada',
                description: 'A transcrição foi atualizada com sucesso.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro ao Atualizar',
                description: 'Não foi possível atualizar a transcrição.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook para deletar gravação
 */
export function useDeleteRecording() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => recordingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: recordingKeys.all });
            toast({
                title: 'Gravação Deletada',
                description: 'A gravação foi deletada com sucesso.',
                variant: 'default',
            });
        },
        onError: () => {
            toast({
                title: 'Erro ao Deletar',
                description: 'Não foi possível deletar a gravação.',
                variant: 'destructive',
            });
        },
    });
}
