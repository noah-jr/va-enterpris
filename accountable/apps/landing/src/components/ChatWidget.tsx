import React, { useState } from 'react';
import { MessageCircle, X, Send, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '244934819272';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o VA OneGest.')}`;

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-lg animate-fadeIn">
          <div className="bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Fale connosco</div>
              <div className="text-[10px] text-zinc-400">Normalmente respondemos em minutos</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
              Escolha como prefere falar connosco:
            </p>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>WhatsApp</span>
            </a>

            <a
              href="mailto:vatechcode@gmail.com"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Email</span>
            </a>

            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-medium text-white dark:text-zinc-950 transition-colors"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Formulário de Contacto</span>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center transition-transform hover:scale-105 shadow-md"
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
};
