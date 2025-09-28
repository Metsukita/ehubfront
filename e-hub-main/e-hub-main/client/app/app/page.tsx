// client/app/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Users, Trophy, Mail } from "lucide-react";
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TournamentListSkeleton } from '@/components/ui/tournament-skeleton';
import { StatsCardSkeleton } from '@/components/ui/dashboard-skeleton';
import { CreateTeamModal } from '@/components/CreateTeamModal';
import { TeamInvitesModal } from '@/components/TeamInvitesModal';

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  game: string;
  owner: {
    name: string;
    email: string;
  };
  members: Array<{
    user: {
      name: string;
      email: string;
    };
  }>;
}

interface TeamInvite {
  id: string;
  team: {
    name: string;
    game: string;
    owner: {
      name: string;
    };
  };
  sender: {
    name: string;
  };
}

export default function AppPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tournamentTeams, setTournamentTeams] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    if (!session?.user?.email) return;

    try {
      // Criar/buscar usuário primeiro
      const userResponse = await fetch('http://localhost:3001/api/users/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      });

      if (userResponse.ok) {
        const user = await userResponse.json();

        // Carregar times do usuário
        const teamsResponse = await fetch(`http://localhost:3001/api/users/${user.id}/teams`);
        if (teamsResponse.ok) {
          const userTeams = await teamsResponse.json();
          setTeams(userTeams);
        }

        // Carregar convites pendentes
        const invitesResponse = await fetch(`http://localhost:3001/api/users/${user.id}/invites`);
        if (invitesResponse.ok) {
          const userInvites = await invitesResponse.json();
          setInvites(userInvites);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTournaments = async () => {
    try {
      const tournamentsResponse = await fetch('http://localhost:3001/api/tournaments/open');
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        setTournaments(tournamentsData);
        
        // Carregar times inscritos para cada torneio
        const teamsPromises = tournamentsData.map(async (tournament: any) => {
          try {
            const teamsResponse = await fetch(`http://localhost:3001/api/tournaments/${tournament.id}/teams`);
            if (teamsResponse.ok) {
              const teamsData = await teamsResponse.json();
              return { tournamentId: tournament.id, ...teamsData };
            }
          } catch (error) {
            console.error(`Erro ao carregar times do torneio ${tournament.id}:`, error);
          }
          return { tournamentId: tournament.id, teams: [], total: 0, maxTeams: 8 };
        });
        
        const allTeamsData = await Promise.all(teamsPromises);
        setTournamentTeams(allTeamsData);
      }
    } catch (error) {
      console.error('Erro ao carregar torneios:', error);
    }
  };

  useEffect(() => {
    loadUserData();
    loadTournaments();
  }, [session]);

  // Redirecionar admin para dashboard
  useEffect(() => {
    if (session && session.user?.email === 'pgsouza48@gmail.com') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Early returns after all hooks
  if (session && session.user?.email === 'pgsouza48@gmail.com') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleTeamCreated = () => {
    setIsCreateModalOpen(false);
    loadUserData(); // Recarregar dados
  };

  const handleInviteProcessed = () => {
    setIsInvitesModalOpen(false);
    loadUserData(); // Recarregar dados
  };

  const handleTeamManagement = (team: Team) => {
    router.push(`/teams/${team.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Header />
        <div className="h-20"></div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Teams section skeleton */}
          <div className="mb-12">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex gap-1">
                        <div className="h-5 w-16 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tournaments section skeleton */}
          <div>
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-6"></div>
            <TournamentListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      
      {/* Espaçamento adicional para o header quando não estiver scrollado */}
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo, {session?.user?.name}!
            </h1>
            <p className="text-gray-400">
              Gerencie seus times e participe de campeonatos
            </p>
          </div>
          
          <div className="flex gap-4">
            {invites.length > 0 && (
              <Button
                onClick={() => setIsInvitesModalOpen(true)}
                variant="outline"
                className="relative"
              >
                <Mail className="h-4 w-4 mr-2" />
                Convites
                <Badge variant="destructive" className="ml-2">
                  {invites.length}
                </Badge>
              </Button>
            )}
            
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Time
            </Button>
          </div>
        </div>

        {/* Seção de Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teams.length === 0 ? (
            <Card className="col-span-full bg-gray-800 border-gray-700">
              <CardHeader className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-white mb-2">
                  Nenhum time encontrado
                </CardTitle>
                <CardDescription className="text-gray-400 mb-4">
                  Crie seu primeiro time ou aguarde convites de outros jogadores
                </CardDescription>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Time
                </Button>
              </CardHeader>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-white text-lg">{team.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {team.game.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Líder:</p>
                      <p className="text-white font-medium">{team.owner.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-2">
                        Membros ({team.members.length + 1}/5):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {team.owner.name} (Líder)
                        </Badge>
                        {team.members.map((member, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {member.user.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleTeamManagement(team)}
                      >
                        {team.owner.email === session?.user?.email ? 'Gerenciar Time' : 'Ver Detalhes'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Torneios */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Torneios CS2 Prime Ativos</h2>
          {tournaments.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <p className="text-gray-400">Nenhum torneio ativo no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => {
                const tournamentTeamData = tournamentTeams.find(t => t.tournamentId === tournament.id);
                const teams = tournamentTeamData?.teams || [];
                const totalTeams = tournamentTeamData?.total || 0;
                const maxTeams = tournamentTeamData?.maxTeams || 8;
                
                return (
                  <div key={tournament.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Times Inscritos</span>
                        <span className="text-white text-sm font-medium">{totalTeams}/{maxTeams}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(totalTeams / maxTeams) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {teams.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Times Registrados:</h4>
                        <div className="space-y-2">
                          {teams.map((team: any) => (
                            <div key={team.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                              {team.logoUrl && (
                                <img 
                                  src={team.logoUrl} 
                                  alt={`${team.name} logo`}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              )}
                              <span className="text-white text-sm font-medium">{team.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                team.registrationStatus === 'APPROVED' 
                                  ? 'bg-green-600 text-green-100' 
                                  : team.registrationStatus === 'REJECTED'
                                  ? 'bg-red-600 text-red-100'
                                  : 'bg-yellow-600 text-yellow-100'
                              }`}>
                                {team.registrationStatus === 'APPROVED' ? 'Aprovado' : 
                                 team.registrationStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Inscrições:</span>
                        <span className="text-white">
                          {tournament.registrationStart && tournament.registrationEnd
                            ? `${new Date(tournament.registrationStart).toLocaleDateString()} - ${new Date(tournament.registrationEnd).toLocaleDateString()}`
                            : 'Datas a definir'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-400">Início:</span>
                        <span className="text-white">
                          {tournament.startDate 
                            ? new Date(tournament.startDate).toLocaleDateString()
                            : 'Data a definir'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção de Campeonatos Disponíveis */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Campeonatos com Inscrições Abertas
            </CardTitle>
            <CardDescription className="text-gray-400">
              Inscreva seus times nos campeonatos disponíveis
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">SG Prime 1ª Edição</h4>
                <div className="flex gap-2 mb-3">
                  <Badge>CS2</Badge>
                  <Badge>Valorant</Badge>
                  <Badge>League of Legends</Badge>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Primeiro campeonato oficial da plataforma com premiações em dinheiro
                </p>
                <Button size="sm" disabled={teams.length === 0}>
                  {teams.length === 0 ? 'Crie um time primeiro' : 'Inscrever Time'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
        userEmail={session?.user?.email}
      />
      
      <TeamInvitesModal
        isOpen={isInvitesModalOpen}
        onClose={() => setIsInvitesModalOpen(false)}
        invites={invites}
        onInviteProcessed={handleInviteProcessed}
      />
    </div>
  );
}