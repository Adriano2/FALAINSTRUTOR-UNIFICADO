/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Minha conta (admin): permite ao usuário logado trocar a própria foto de
 * perfil (avatar) e o nome. Salva no banco via onSave (PATCH /auth/me).
 */

import React from 'react';
import { Save, Check } from 'lucide-react';
import { User } from '../../types';
import AvatarUploader from '../AvatarUploader';

interface MyAccountProps {
  currentUser?: User;
  onSave?: (props: Partial<User>) => void;
}

export default function MyAccount({ currentUser, onSave }: MyAccountProps) {
  const [name, setName] = React.useState(currentUser?.name ?? '');
  const [avatar, setAvatar] = React.useState(currentUser?.avatar ?? '');
  const [saved, setSaved] = React.useState(false);

  if (!currentUser) {
    return <p className="text-xs text-slate-400">Faça login para editar sua conta.</p>;
  }

  const save = () => {
    onSave?.({ name: name.trim() || currentUser.name, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Minha conta</h2>
        <p className="text-xs text-slate-400">Atualize sua foto de perfil e seu nome. A foto aparece no topo do painel.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase">Foto de perfil</label>
          <AvatarUploader value={avatar} name={name} onChange={setAvatar} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 block uppercase">E-mail (login)</label>
          <p className="text-sm text-slate-600 dark:text-slate-300">{currentUser.email}</p>
        </div>

        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
        >
          {saved ? <><Check className="w-4 h-4" /> Salvo</> : <><Save className="w-4 h-4" /> Salvar alterações</>}
        </button>
      </div>
    </div>
  );
}
