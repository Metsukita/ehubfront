// client/app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, CreditCard, DollarSign, Download, Users, PlusCircle, Trophy, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/Overview';
import { RecentSales } from '@/components/dashboard/RecentSales';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardStatsSkeleton, TeamTableSkeleton, TournamentTableSkeleton } from '@/components/ui/dashboard-skeleton';
import { useState, useEffect } from 'react';

interface DashboardStats {
  users: {
    total: number;
    players: number;
    admins: number;
  };
  teams: {
    total: number;
    active: number;
    deleted: number;
  };
  tournaments: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
  };
  payments: {
    total: number;
    pending: number;
    paid: number;
    cancelled: number;
    expired: number;
    totalAmount: number;
    paidAmount: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
  _count: {
    ownedTeams: number;
    teamMemberships: number;
  };
}

interface Team {
  id: string;
  name: string;
  game: string;
  owner: {
    name: string;
    email: string;
  };
  members: any[];
  payments: any[];
  createdAt: string;
  isDeleted: boolean;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  startDate: string;
  endDate: string;
  teams: any[];
  payments: any[];
  _count: {
    teams: number;
    payments: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentDate?: string;
  team: {
    name: string;
    owner: {
      name: string;
      email: string;
    };
  };
  tournament: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para dados
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [playersData, setPlayersData] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas gerais
      const statsResponse = await fetch('http://localhost:3001/api/admin/dashboard/stats', {
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Carregar usuários
      const usersResponse = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
        setPlayersData(usersData); // Usar os mesmos dados para a aba de players
      }

      // Carregar times
      const teamsResponse = await fetch('http://localhost:3001/api/admin/teams', {
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }

      // Carregar torneios
      const tournamentsResponse = await fetch('http://localhost:3001/api/admin/tournaments', {
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        setTournaments(tournamentsData);
      }

      // Carregar pagamentos
      const paymentsResponse = await fetch('http://localhost:3001/api/admin/payments', {
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      loadDashboardData();
    }
  }, [session]);

  // Funções para ações administrativas
  const approveTeam = async (tournamentId: string, teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/tournaments/${tournamentId}/teams/${teamId}/approve`, {
        method: 'PATCH',
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (response.ok) {
        loadDashboardData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao aprovar time:', error);
    }
  };

  const rejectTeam = async (tournamentId: string, teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/tournaments/${tournamentId}/teams/${teamId}/reject`, {
        method: 'PATCH',
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (response.ok) {
        loadDashboardData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao rejeitar time:', error);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-email': session?.user?.email || ''
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        loadDashboardData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/teams/${teamId}/force`, {
        method: 'DELETE',
        headers: {
          'user-email': session?.user?.email || ''
        }
      });
      
      if (response.ok) {
        loadDashboardData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao excluir time:', error);
    }
  };

  // Função para criar torneio
  const handleCreateTournament = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3001/api/admin/tournaments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-email': session?.user?.email || ''
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar torneio');
      }

      alert('Torneio criado com sucesso!');
      setDialogOpen(false);
      loadDashboardData();

    } catch (error: any) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-20"></div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <DashboardStatsSkeleton />

          <div className="mt-8">
            {/* Tabs skeleton */}
            <div className="flex space-x-1 mb-6">
              <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Content skeletons */}
            <div className="grid gap-6 md:grid-cols-2">
              <TeamTableSkeleton />
              <TournamentTableSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreatePlayer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3001/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar player');
      }

      // Sucesso!
      alert('Player criado com sucesso!');
      setDialogOpen(false); // Fecha o dialog
      // Opcional: Recarregar dados da página
      router.refresh();

    } catch (error: any) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      <div className="h-20"></div>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 border-none">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1 cursor-pointer">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo Player
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
                <form onSubmit={handleCreatePlayer}>
                  <DialogHeader>
                    <DialogTitle className="text-white">Cadastrar Novo Player</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Preencha as informações abaixo para adicionar um novo player ao sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nickname" className="text-right text-white">
                      Nickname
                    </Label>
                    <Input
                      id="nickname"
                      name="nickname"
                      placeholder="Ex: TheChosenOne"
                      className="col-span-3 placeholder:text-gray-400 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-white">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: João da Silva"
                      className="col-span-3 placeholder:text-gray-400 bg-gray-700 border-gray-600 text-white"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ex: joao@email.com"
                      className="col-span-3 placeholder:text-gray-400 bg-gray-700 border-gray-600 text-white"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right text-white">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      className="col-span-3 placeholder:text-gray-400 bg-gray-700 border-gray-600 text-white"
                    />
                    </div>
                  </div>
                  <DialogFooter>
                      <Button className='bg-white text-black hover:bg-white cursor-pointer' type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Player"}
                      </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" className="h-7 gap-1 cursor-pointer border-gray-600 text-white hover:bg-gray-700">
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">Visão Geral</TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">Players</TabsTrigger>
            <TabsTrigger value="analytics" disabled className="text-gray-500">Analíticos</TabsTrigger>
            <TabsTrigger value="reports" disabled className="text-gray-500">Relatórios</TabsTrigger>
            <TabsTrigger value="notifications" disabled className="text-gray-500">Notificações</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className='bg-gray-800 border-gray-700'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Total de Vitórias
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">45,231</div>
                  <p className="text-xs text-gray-400">
                    +20.1% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card className='bg-gray-800 border-gray-700'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Players Ativos</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">+2350</div>
                  <p className="text-xs text-gray-400">
                    +180.1% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card className='bg-gray-800 border-gray-700'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Campeonatos</CardTitle>
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">+12</div>
                  <p className="text-xs text-gray-400">
                    +19% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card className='bg-gray-800 border-gray-700'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Partidas Jogadas</CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">+573</div>
                  <p className="text-xs text-gray-400">
                    +201 desde a última hora
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Visão Geral de Performance</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Inscrições Recentes</CardTitle>
                  <CardDescription className="text-gray-400">
                    26 jogadores se inscreveram este mês.
                  </CardDescription>
                </CardHeader>
                <CardContent >
                  <RecentSales  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="players" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Players Registrados</CardTitle>
                <CardDescription className="text-gray-400">
                  Lista completa de todos os players registrados na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playersData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Nenhum player encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playersData.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                        <div className="flex items-center space-x-4">
                          {player.image ? (
                            <img 
                              src={player.image} 
                              alt={player.name || player.nickname}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {(player.name || player.nickname)?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-white font-medium">{player.name || player.nickname}</h3>
                            <p className="text-gray-400 text-sm">@{player.nickname}</p>
                            <p className="text-gray-400 text-sm">{player.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-400">Times</p>
                            <p className="text-white font-medium">{player.teamsCount || 0}</p>
                          </div>
                          
                          {player.phone && (
                            <div className="text-center">
                              <p className="text-gray-400">Telefone</p>
                              <p className="text-white font-medium">{player.phone}</p>
                            </div>
                          )}
                          
                          {player.steamId && (
                            <div className="text-center">
                              <p className="text-gray-400">Steam ID</p>
                              <p className="text-white font-medium">{player.steamId}</p>
                            </div>
                          )}
                          
                          {player.currentEloGC && (
                            <div className="text-center">
                              <p className="text-gray-400">GC Elo</p>
                              <p className="text-white font-medium">{player.currentEloGC}</p>
                            </div>
                          )}
                          
                          {player.peakRankFaceit && (
                            <div className="text-center">
                              <p className="text-gray-400">Faceit</p>
                              <p className="text-white font-medium">{player.peakRankFaceit}</p>
                            </div>
                          )}
                          
                          {player.whatsapp && (
                            <div className="text-center">
                              <p className="text-gray-400">WhatsApp</p>
                              <p className="text-white font-medium">{player.whatsapp}</p>
                            </div>
                          )}
                          
                          {player.instagram && (
                            <div className="text-center">
                              <p className="text-gray-400">Instagram</p>
                              <p className="text-white font-medium">@{player.instagram}</p>
                            </div>
                          )}
                          
                          <div className="text-center">
                            <p className="text-gray-400">Registro</p>
                            <p className="text-white font-medium">
                              {new Date(player.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <Badge variant={player.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                            {player.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}