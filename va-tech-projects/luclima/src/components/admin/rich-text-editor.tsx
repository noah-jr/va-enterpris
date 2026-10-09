'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Code, Loader2
} from 'lucide-react';
import { useCallback, useState, useRef } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Falha no upload');

            const data = await res.json();
            editor.chain().focus().setImage({ src: data.url }).run();
        } catch (err) {
            console.error(err);
            alert('Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Negrito"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Itálico"
            >
                <Italic size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Rasurado"
            >
                <Strikethrough size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Título 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Título 2"
            >
                <Heading2 size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Lista com marcadores"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Lista numerada"
            >
                <ListOrdered size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Citação"
            >
                <Quote size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Código"
            >
                <Code size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

            <button
                type="button"
                onClick={setLink}
                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                title="Link"
            >
                <LinkIcon size={18} />
            </button>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50"
                title="Imagem"
            >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>

            <div className="flex-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-30"
                title="Desfazer"
            >
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-30"
                title="Refazer"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-gray-900 hover:text-gray-800 underline',
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none dark:prose-invert max-w-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 overflow-hidden flex flex-col">
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto max-h-[600px] cursor-text bg-white dark:bg-gray-950">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
