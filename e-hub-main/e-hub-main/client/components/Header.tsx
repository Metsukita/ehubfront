'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import LoginButton from "./LoginButton";
import { useEffect, useState } from "react";
import Image from "next/image";

// Tipo local para o player, caso não tenha um compartilhado
type Player = {
  id: string;
  name: string | null;
  nickname: string;
  image: string | null;
};

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Muda após 100px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Evita a busca com menos de 2 caracteres
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchPlayers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:3001/api/players/search?q=${searchQuery}`);
        if (response.ok) {
          const data: Player[] = await response.json();
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Erro ao buscar players:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce: espera 300ms após o usuário parar de digitar para fazer a busca
    const debounceTimer = setTimeout(() => {
      searchPlayers();
    }, 300);

    // Limpa o timer se o usuário digitar novamente
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className={`${isScrolled ? 'fixed top-4 left-0 w-full flex justify-center z-50' : 'relative w-full flex justify-center'} pointer-events-none transition-all duration-300`}>
      <header
        className={`pointer-events-auto border-none flex h-16 items-center gap-4 px-4 sm:px-6 rounded-xl max-w-7xl w-[99vw] mx-auto transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/90 backdrop-blur-lg shadow-xl border border-gray-700' 
            : 'bg-black/20 backdrop-blur-sm shadow-none border-transparent hover:bg-black/30'
        }`}
      >
        {/* Menu lateral para mobile (se houver) */}
        <div className="md:hidden">
          {/* Seu componente Sheet aqui */}
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-lg font-medium">
            <Link href="/dashboard" className="flex items-center">
            <Image
              src="https://cdn.discordapp.com/attachments/1255920914906742875/1413673739454906438/LOGO-EXTENSO.png?ex=68bcc9c4&is=68bb7844&hm=45739bc424d0dcafaadad846858783d3f712513ffb2c1e24ce06bcd5f748b53d&"
              alt="eHub Logo"
              width={220}
              height={100}
              className="object-contain"
            />
            </Link>
          {/* Outros links */}
        </nav>

        {/* Barra de Busca e Botões da Direita */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar players..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Resultados da Busca */}
              {searchQuery.length > 1 && (
                <div
                  className="absolute top-full mt-2 w-full rounded-md bg-black/90 border border-border shadow-lg z-10"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((player) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.nickname}`}
                        className="block p-3 hover:bg-accent"
                        onClick={() => setSearchQuery("")} // Limpa a busca ao clicar
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={player.image || 'https://cdn.discordapp.com/attachments/1255920914906742875/1413619751124729937/images.png?ex=68bc977c&is=68bb45fc&hm=116a11dc44bad7bc3045ae5aed7502b77a2888e04ba3c3dc67985c71d49680f7&'}
                            alt={player.nickname}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold">{player.nickname}</div>
                            <div className="text-sm text-muted-foreground">{player.name}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</div>
                  )}
                </div>
              )}
            </div>
          </form>
          <LoginButton />
        </div>
      </header>
    </div>
  );
}
