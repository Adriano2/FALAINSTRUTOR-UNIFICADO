/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Upload de foto de perfil (avatar). Lê o arquivo, recorta no centro e reduz
 * para 256×256 (JPEG comprimido) via canvas — gera um data URL leve que é
 * salvo no campo avatar do usuário. Também aceita colar uma URL.
 */

import React from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  value: string;
  name?: string;
  onChange: (dataUrlOrUrl: string) => void;
}

export default function AvatarUploader({ value, name, onChange }: AvatarUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const handleFile = (file?: File | null) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione um arquivo de imagem.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Imagem muito grande (máx. 8 MB).'); return; }
    setBusy(true);
    const reader = new FileReader();
    reader.onerror = () => { setBusy(false); setError('Não foi possível ler a imagem.'); };
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => { setBusy(false); setError('Imagem inválida.'); };
      img.onload = () => {
        try {
          const size = 256;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) { setBusy(false); setError('Falha ao processar a imagem.'); return; }
          // Recorte central cobrindo o quadrado.
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          onChange(canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          setError('Falha ao processar a imagem.');
        } finally {
          setBusy(false);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {value ? (
          <img src={value} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-extrabold text-slate-400">{initials || '?'}</span>
        )}
        {busy && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> Enviar foto
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400">JPG ou PNG. A imagem é reduzida para 256×256 automaticamente.</p>
        {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
