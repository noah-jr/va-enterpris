import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService, { CompanyFilters } from '@/lib/services/company.service';

export function useCompanies(filters: CompanyFilters = {}) {
    return useQuery({
        queryKey: ['companies', filters],
        queryFn: () => companyService.getAll(filters)
    });
}

export function useCompany(id: string) {
    return useQuery({
        queryKey: ['company', id],
        queryFn: () => companyService.getById(id),
        enabled: !!id
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => companyService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        }
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => companyService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
        }
    });
}

export function useApproveCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => companyService.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        }
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => companyService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        }
    });
}
