export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD') // Decompor caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
        .replace(/\s+/g, '-') // Substituir espaços por hífens
        .replace(/-+/g, '-') // Remover hífens duplicados
        .replace(/^-+|-+$/g, ''); // Remover hífens do início e fim
}
