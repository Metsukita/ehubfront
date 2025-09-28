// client/components/LoginButton.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button'; // Usando o botão do Shadcn que já instalamos
import Image from 'next/image';
import React, { useState } from 'react';


export default function LoginButton() {
  // O hook useSession nos dá o status da sessão e os dados do usuário
  const { data: session, status } = useSession();

  // Status pode ser 'loading', 'authenticated', ou 'unauthenticated'
  if (status === 'loading') {
    return <Button disabled>Carregando...</Button>;
  }

  if (status === 'authenticated') {
    const [loading, setLoading] = useState(false);

    // Se o usuário estiver logado
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <Image
        src={session.user.image}
        alt={session.user.name ?? 'Avatar'}
        width={40}
        height={40}
        className="rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium">{session.user?.name}</p>
          <p className="text-xs text-gray-500">{session.user?.email}</p>
        </div>
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={async () => {
        setLoading(true);
        await signOut({ callbackUrl: '/' });
        setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? 'Saindo...' : 'Sair'}
        </Button>
      </div>
    );
  }

  // Se o usuário não estiver logado
  return (
    <Button className='cursor-pointer' onClick={() => signIn('google')}>
      Entrar com Google
    </Button>
  );
}