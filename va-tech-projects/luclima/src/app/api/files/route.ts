import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');

        if (!existsSync(uploadsDir)) {
            return NextResponse.json({ files: [] });
        }

        const files = await readdir(uploadsDir);
        const fileDetails = await Promise.all(
            files.map(async (filename) => {
                const filepath = join(uploadsDir, filename);
                const stats = await stat(filepath);

                const extension = filename.split('.').pop()?.toLowerCase();
                let type = 'file';
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
                    type = 'image';
                } else if (extension === 'pdf') {
                    type = 'pdf';
                } else if (['doc', 'docx'].includes(extension || '')) {
                    type = 'doc';
                }

                return {
                    id: filename,
                    name: filename,
                    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    sizeBytes: stats.size,
                    type,
                    date: stats.mtime.toLocaleDateString('pt-PT'),
                    url: `/uploads/${filename}`
                };
            })
        );

        // Sort by date descending
        fileDetails.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
            const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ files: fileDetails });
    } catch (error) {
        console.error('List files error:', error);
        return NextResponse.json({ error: 'Erro ao listar ficheiros' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: 'Nome do ficheiro não especificado' }, { status: 400 });
        }

        const filepath = join(process.cwd(), 'public', 'uploads', filename);

        if (!existsSync(filepath)) {
            return NextResponse.json({ error: 'Ficheiro não encontrado' }, { status: 404 });
        }

        await unlink(filepath);

        return NextResponse.json({ message: 'Ficheiro eliminado com sucesso' });
    } catch (error) {
        console.error('Delete file error:', error);
        return NextResponse.json({ error: 'Erro ao eliminar ficheiro' }, { status: 500 });
    }
}
