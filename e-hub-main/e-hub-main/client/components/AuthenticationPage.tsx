// client/components/AuthenticationPage.tsx
'use client';

import { Icons } from "./icons";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";


export function AuthenticationPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
    setLoading(false);
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Lado Esquerdo: Imagem de Fundo */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        {/* Imagem de fundo com blur reduzido */}
        <Image
          src="/bglogin.jpg"
          alt="Background Login"
          fill
          className="absolute inset-0 object-cover z-0 blur-[2px]"
          priority
        />
        <div className="absolute inset-0 bg-zinc-900/60 z-10" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          {/* Logo e-Hub */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="mr-2">e-Hub</span>
          {/* Sinal de + grande */}
          <span className="mx-2 text-4xl font-bold text-white drop-shadow">+</span>
          {/* Logo styxx aumentada */}
          <Image
            src="https://cdn.discordapp.com/attachments/1255920914906742875/1413291935665487944/Logo2.png?ex=68bb662f&is=68ba14af&hm=731946509ed0281b02842d0bf9da67c81ec2acdcbd320b2a99137b523cda0081&"
            alt="Logo styxx"
            width={90}
            height={90}
            className="ml-1"
            priority
          />
        </div>
      </div>

      {/* Lado Direito: Formulário de Login */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acesse sua Conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Use sua conta do Google para entrar na plataforma.
            </p>
          </div>

          {/* Nosso botão de login adaptado */}
          <Button 
            variant="outline" 
            className="cursor-pointer"
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-gray-200 border-t-primary"></span>
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Entrar com Google
          </Button>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao clicar em continuar, você concorda com nossos{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}