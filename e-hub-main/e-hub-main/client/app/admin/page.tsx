'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, Activity, PlusCircle, Wifi, Database, Globe, Server } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalTournaments: number;
  totalPayments: number;
}

interface User {
  id: string;
  nickname: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'PAID' | 'REJECTED';
  createdAt: string;
  leader?: {
    nickname: string;
  };
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  price?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  createdAt: string;
  teams?: any[];
}

interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  team?: {
    name: string;
  };
  tournament?: {
    name: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalTournaments: 0,
    totalPayments: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Estado para status dos serviços
  const [serviceStatus, setServiceStatus] = useState({
    auth: { status: 'loading', message: 'Verificando autenticação...' },
    backend: { status: 'loading', message: 'Conectando ao servidor...' },
    database: { status: 'loading', message: 'Verificando banco de dados...' },
    apis: { status: 'loading', message: 'Testando APIs...' }
  });

  // Estado para monitoramento avançado
  const [monitoring, setMonitoring] = useState({
    ping: { latency: 0, status: 'loading', message: 'Medindo latência...' },
    dbPing: { latency: 0, status: 'loading', message: 'Testando banco...' },
    region: { location: '', status: 'loading', message: 'Detectando região...' },
    gateway: { status: 'loading', message: 'Verificando gateway...' }
  });
  
  const [tournamentDialogOpen, setTournamentDialogOpen] = useState(false);
  
  // Estado para modal de membros do time
  const [teamMembersDialogOpen, setTeamMembersDialogOpen] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any>(null);

  // Estados para gerenciamento de torneios
  const [editTournamentDialogOpen, setEditTournamentDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  // Verificar se é admin
  useEffect(() => {
    if (status === 'loading') {
      setServiceStatus(prev => ({
        ...prev,
        auth: { status: 'loading', message: 'Carregando sessão...' }
      }));
      return;
    }
    
    setServiceStatus(prev => ({
      ...prev,
      auth: {
        status: session?.user?.email === 'pgsouza48@gmail.com' ? 'success' : 'error',
        message: session?.user?.email === 'pgsouza48@gmail.com' 
          ? `Autenticado como ${session.user.email}` 
          : `Email atual: ${session?.user?.email || 'Não logado'}`
      }
    }));
    
    if (!session?.user?.email || session.user.email !== 'pgsouza48@gmail.com') {
      router.push('/dashboard');
      return;
    }

    // Carregar dados do admin
    loadDashboardData();
    
    // Inicializar monitoramento
    getServerInfo();
    checkDatabaseStatus();
    measurePing();
  }, [session, status, router]);

  // Efeito para ping contínuo a cada 1 segundo
  useEffect(() => {
    const pingInterval = setInterval(() => {
      measurePing();
    }, 1000);

    const statusInterval = setInterval(() => {
      checkDatabaseStatus();
    }, 5000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Testar conexão com backend
      setServiceStatus(prev => ({
        ...prev,
        backend: { status: 'loading', message: 'Testando conexão...' }
      }));

      // Carregar estatísticas (usando endpoint de teste)
      const statsResponse = await fetch('http://localhost:3001/api/admin/test-data');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDashboardStats(stats);
        setServiceStatus(prev => ({
          ...prev,
          backend: { status: 'success', message: 'Conectado com sucesso' },
          database: { status: 'success', message: `${stats.totalUsers} usuários, ${stats.totalTeams} times` }
        }));
      } else {
        setServiceStatus(prev => ({
          ...prev,
          backend: { status: 'error', message: `Erro ${statsResponse.status}` }
        }));
      }

      // Carregar usuários (usando endpoint de teste)
      const usersResponse = await fetch('http://localhost:3001/api/admin/test-users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Carregar times (usando endpoint de teste)
      const teamsResponse = await fetch('http://localhost:3001/api/admin/test-teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }

      // Carregar torneios (usando endpoint de teste)
      const tournamentsResponse = await fetch('http://localhost:3001/api/admin/test-tournaments');
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        setTournaments(tournamentsData);
      }

      // Atualizar status das APIs
      setServiceStatus(prev => ({
        ...prev,
        apis: { 
          status: 'success', 
          message: `${users.length + teams.length} recursos carregados` 
        }
      }));

    } catch (error) {
      setServiceStatus(prev => ({
        ...prev,
        backend: { status: 'error', message: 'Falha na conexão' },
        apis: { status: 'error', message: `Erro: ${error}` }
      }));
    }
  };

  // Função para medir ping do servidor
  const measurePing = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:3001/api/admin/ping');
      const endTime = performance.now();
      
      if (response.ok) {
        const latency = Math.round(endTime - startTime);
        setMonitoring(prev => ({
          ...prev,
          ping: {
            latency,
            status: latency < 100 ? 'success' : latency < 300 ? 'warning' : 'error',
            message: `${latency}ms`
          }
        }));
      }
    } catch (error) {
      setMonitoring(prev => ({
        ...prev,
        ping: { latency: 0, status: 'error', message: 'Falha na conexão' }
      }));
    }
  };

  // Função para verificar status do banco
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/db-status');
      if (response.ok) {
        const data = await response.json();
        setMonitoring(prev => ({
          ...prev,
          dbPing: {
            latency: data.latency,
            status: data.latency < 50 ? 'success' : data.latency < 250 ? 'warning' : 'error',
            message: `${data.latency}ms - ${data.database}`
          }
        }));
      }
    } catch (error) {
      setMonitoring(prev => ({
        ...prev,
        dbPing: { latency: 0, status: 'error', message: 'Banco indisponível' }
      }));
    }
  };

  // Função para obter informações do servidor
  const getServerInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/server-info');
      if (response.ok) {
        const data = await response.json();
        setMonitoring(prev => ({
          ...prev,
          region: {
            location: data.region,
            status: 'success',
            message: `${data.platform} - ${data.timezone}`
          },
          gateway: {
            status: 'success',
            message: `Uptime: ${Math.round(data.uptime / 60)}min`
          }
        }));
      }
    } catch (error) {
      setMonitoring(prev => ({
        ...prev,
        region: { location: '', status: 'error', message: 'Região indisponível' },
        gateway: { status: 'error', message: 'Gateway offline' }
      }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Usuário excluído com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };



  const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tournamentData = {
      name: formData.get('name') as string,
      game: formData.get('game') as string,
      price: parseFloat(formData.get('price') as string) || 150,
      maxTeams: parseInt(formData.get('maxTeams') as string) || 8,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de hoje
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias a partir de hoje
      prizePool: parseFloat(formData.get('price') as string) * parseInt(formData.get('maxTeams') as string) * 0.8 || 1000, // 80% das inscrições
    };

    try {
      const response = await fetch('http://localhost:3001/api/admin/test-create-tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData),
      });

      if (response.ok) {
        alert('Campeonato criado com sucesso!');
        setTournamentDialogOpen(false);
        loadDashboardData();
      } else {
        const error = await response.text();
        alert(`Erro ao criar campeonato: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao criar campeonato:', error);
      alert('Erro ao criar campeonato');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/payments/${paymentId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Pagamento aprovado com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao aprovar pagamento');
      }
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error);
      alert('Erro ao aprovar pagamento');
    }
  };

  // Funções para gerenciamento de times
  const handleViewTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-team-details/${teamId}`);
      if (response.ok) {
        const teamData = await response.json();
        setSelectedTeamMembers(teamData);
        setTeamMembersDialogOpen(true);
      } else {
        alert('Erro ao carregar dados do time');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do time:', error);
      alert('Erro ao carregar dados do time');
    }
  };

  const handleApproveTeam = async (teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-approve-team/${teamId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Time aprovado com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao aprovar time');
      }
    } catch (error) {
      console.error('Erro ao aprovar time:', error);
      alert('Erro ao aprovar time');
    }
  };

  const handleRejectTeam = async (teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-reject-team/${teamId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Time rejeitado com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao rejeitar time');
      }
    } catch (error) {
      console.error('Erro ao rejeitar time:', error);
      alert('Erro ao rejeitar time');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-delete-team/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Time excluído com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao excluir time');
      }
    } catch (error) {
      console.error('Erro ao excluir time:', error);
      alert('Erro ao excluir time');
    }
  };

  // Funções para gerenciamento de torneios
  const handleEditTournament = async (tournamentId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-tournament-details/${tournamentId}`);
      if (response.ok) {
        const tournamentData = await response.json();
        setSelectedTournament(tournamentData);
        setEditTournamentDialogOpen(true);
      } else {
        alert('Erro ao carregar dados do torneio');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do torneio:', error);
      alert('Erro ao carregar dados do torneio');
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tournamentData = {
      name: formData.get('name') as string,
      game: formData.get('game') as string,
      price: parseFloat(formData.get('price') as string),
      maxTeams: parseInt(formData.get('maxTeams') as string),
      prizePool: parseFloat(formData.get('prizePool') as string),
      status: formData.get('status') as string,
    };

    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-update-tournament/${selectedTournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData),
      });

      if (response.ok) {
        alert('Torneio atualizado com sucesso!');
        setEditTournamentDialogOpen(false);
        setSelectedTournament(null);
        loadDashboardData();
      } else {
        const error = await response.text();
        alert(`Erro ao atualizar torneio: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar torneio:', error);
      alert('Erro ao atualizar torneio');
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este torneio? Esta ação não pode ser desfeita e removerá todos os times registrados.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/test-delete-tournament/${tournamentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Torneio excluído com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao excluir torneio');
      }
    } catch (error) {
      console.error('Erro ao excluir torneio:', error);
      alert('Erro ao excluir torneio');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/payments/${paymentId}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Pagamento rejeitado com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao rejeitar pagamento');
      }
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error);
      alert('Erro ao rejeitar pagamento');
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-white">Carregando...</div>
    </div>;
  }

  if (!session?.user?.email || session.user.email !== 'pgsouza48@gmail.com') {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-white">Acesso negado</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      <div className="h-20"></div>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <div className="text-sm text-gray-400">
            Bem-vindo, Administrador
          </div>
        </div>

        {/* Cards de Status do Sistema */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className={`border ${serviceStatus.auth.status === 'success' ? 'bg-green-900 border-green-700' : serviceStatus.auth.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Autenticação</CardTitle>
              <Users className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {serviceStatus.auth.status === 'success' ? 'Funcionando' : serviceStatus.auth.status === 'error' ? 'Com Problemas' : 'Carregando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {serviceStatus.auth.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${serviceStatus.backend.status === 'success' ? 'bg-green-900 border-green-700' : serviceStatus.backend.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Servidor Backend</CardTitle>
              <Activity className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {serviceStatus.backend.status === 'success' ? 'Funcionando' : serviceStatus.backend.status === 'error' ? 'Com Problemas' : 'Conectando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {serviceStatus.backend.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${serviceStatus.database.status === 'success' ? 'bg-green-900 border-green-700' : serviceStatus.database.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Banco de Dados</CardTitle>
              <CreditCard className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {serviceStatus.database.status === 'success' ? 'Funcionando' : serviceStatus.database.status === 'error' ? 'Com Problemas' : 'Verificando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {serviceStatus.database.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${serviceStatus.apis.status === 'success' ? 'bg-green-900 border-green-700' : serviceStatus.apis.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">APIs Admin</CardTitle>
              <PlusCircle className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {serviceStatus.apis.status === 'success' ? 'Funcionando' : serviceStatus.apis.status === 'error' ? 'Com Problemas' : 'Testando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {serviceStatus.apis.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Monitoramento Avançado */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className={`border ${monitoring.ping.status === 'success' ? 'bg-green-900 border-green-700' : monitoring.ping.status === 'warning' ? 'bg-yellow-900 border-yellow-700' : monitoring.ping.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-gray-900 border-gray-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ping Servidor</CardTitle>
              <Wifi className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {monitoring.ping.latency > 0 ? `${monitoring.ping.latency}ms` : '---'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {monitoring.ping.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${monitoring.dbPing.status === 'success' ? 'bg-green-900 border-green-700' : monitoring.dbPing.status === 'warning' ? 'bg-yellow-900 border-yellow-700' : monitoring.dbPing.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-gray-900 border-gray-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ping Database</CardTitle>
              <Database className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {monitoring.dbPing.latency > 0 ? `${monitoring.dbPing.latency}ms` : '---'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {monitoring.dbPing.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${monitoring.region.status === 'success' ? 'bg-blue-900 border-blue-700' : 'bg-gray-900 border-gray-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Região Servidor</CardTitle>
              <Globe className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {monitoring.region.location || 'Detectando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {monitoring.region.message}
              </p>
            </CardContent>
          </Card>

          <Card className={`border ${monitoring.gateway.status === 'success' ? 'bg-purple-900 border-purple-700' : monitoring.gateway.status === 'error' ? 'bg-red-900 border-red-700' : 'bg-gray-900 border-gray-700'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Status Gateway</CardTitle>
              <Server className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {monitoring.gateway.status === 'success' ? 'Online' : monitoring.gateway.status === 'error' ? 'Offline' : 'Verificando...'}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {monitoring.gateway.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{dashboardStats.totalUsers}</div>
              <p className="text-xs text-gray-400">
                usuários cadastrados
              </p>
            </CardContent>
          </Card>
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total de Times</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{dashboardStats.totalTeams}</div>
              <p className="text-xs text-gray-400">
                times criados
              </p>
            </CardContent>
          </Card>
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Campeonatos</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{dashboardStats.totalTournaments}</div>
              <p className="text-xs text-gray-400">
                campeonatos ativos
              </p>
            </CardContent>
          </Card>
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pagamentos</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{dashboardStats.totalPayments}</div>
              <p className="text-xs text-gray-400">
                pagamentos registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Gerenciamento */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className='bg-gray-800 border-gray-700'>
            <TabsTrigger value="users" className='text-white data-[state=active]:bg-gray-600'>Usuários</TabsTrigger>
            <TabsTrigger value="teams" className='text-white data-[state=active]:bg-gray-600'>Times</TabsTrigger>
            <TabsTrigger value="tournaments" className='text-white data-[state=active]:bg-gray-600'>Campeonatos</TabsTrigger>
            <TabsTrigger value="payments" className='text-white data-[state=active]:bg-gray-600'>Pagamentos</TabsTrigger>
          </TabsList>

          {/* Tab de Usuários */}
          <TabsContent value="users" className="space-y-4">
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className="text-white">Gerenciar Usuários</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize e gerencie todos os usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Nickname</TableHead>
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Telefone</TableHead>
                      <TableHead className="text-gray-300">Criado em</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{user.nickname}</TableCell>
                        <TableCell className="text-gray-300">{user.name || '-'}</TableCell>
                        <TableCell className="text-gray-300">{user.email || '-'}</TableCell>
                        <TableCell className="text-gray-300">{user.phone || '-'}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Times */}
          <TabsContent value="teams" className="space-y-4">
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className="text-white">Gerenciar Times</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize e gerencie todos os times cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Nome do Time</TableHead>
                      <TableHead className="text-gray-300">Líder</TableHead>
                      <TableHead className="text-gray-300">Status de Registro</TableHead>
                      <TableHead className="text-gray-300">Status de Pagamento</TableHead>
                      <TableHead className="text-gray-300">Criado em</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{team.name}</TableCell>
                        <TableCell className="text-gray-300">{team.leader?.nickname || '-'}</TableCell>
                        <TableCell className="text-gray-300">
                          <span className={`px-2 py-1 rounded text-xs ${
                            team.registrationStatus === 'APPROVED' ? 'bg-green-600 text-white' :
                            team.registrationStatus === 'REJECTED' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {team.registrationStatus === 'APPROVED' ? 'Aprovado' :
                             team.registrationStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <span className={`px-2 py-1 rounded text-xs ${
                            team.paymentStatus === 'PAID' ? 'bg-green-600 text-white' :
                            team.paymentStatus === 'REJECTED' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {team.paymentStatus === 'PAID' ? 'Pago' :
                             team.paymentStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(team.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                            onClick={() => handleViewTeamMembers(team.id)}
                          >
                            Ver Membros
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                            onClick={() => handleApproveTeam(team.id)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            onClick={() => handleRejectTeam(team.id)}
                          >
                            Rejeitar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Campeonatos */}
          <TabsContent value="tournaments" className="space-y-4">
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Gerenciar Campeonatos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Crie e gerencie campeonatos
                    </CardDescription>
                  </div>
                  <Dialog open={tournamentDialogOpen} onOpenChange={setTournamentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Novo Campeonato
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
                      <form onSubmit={handleCreateTournament}>
                        <DialogHeader>
                          <DialogTitle className="text-white">Criar Novo Campeonato</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Preencha as informações do novo campeonato
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tournament-name" className="text-right text-white">
                              Nome
                            </Label>
                            <Input
                              id="tournament-name"
                              name="name"
                              placeholder="Ex: Copa de Verão 2024"
                              className="col-span-3 bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tournament-game" className="text-right text-white">
                              Jogo
                            </Label>
                            <select
                              id="tournament-game"
                              name="game"
                              className="col-span-3 bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                              required
                            >
                              <option value="">Selecione um jogo</option>
                              <option value="CS2">Counter-Strike 2</option>
                              <option value="VALORANT">Valorant</option>
                              <option value="LEAGUE_OF_LEGENDS">League of Legends</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tournament-price" className="text-right text-white">
                              Preço (R$)
                            </Label>
                            <Input
                              id="tournament-price"
                              name="price"
                              type="number"
                              step="0.01"
                              placeholder="150.00"
                              defaultValue="150.00"
                              className="col-span-3 bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tournament-maxTeams" className="text-right text-white">
                              Max Times
                            </Label>
                            <Input
                              id="tournament-maxTeams"
                              name="maxTeams"
                              type="number"
                              min="2"
                              max="64"
                              placeholder="8"
                              defaultValue="8"
                              className="col-span-3 bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tournament-description" className="text-right text-white">
                              Descrição
                            </Label>
                            <textarea
                              id="tournament-description"
                              name="description"
                              placeholder="Descrição do campeonato..."
                              className="col-span-3 bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Criar Campeonato
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Jogo</TableHead>
                      <TableHead className="text-gray-300">Preço</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Inscrições</TableHead>
                      <TableHead className="text-gray-300">Criado em</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournaments.map((tournament) => (
                      <TableRow key={tournament.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{tournament.name}</TableCell>
                        <TableCell className="text-gray-300">{tournament.game}</TableCell>
                        <TableCell className="text-gray-300">
                          R$ {tournament.price ? tournament.price.toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tournament.status === 'ACTIVE' ? 'bg-green-600 text-white' :
                            tournament.status === 'COMPLETED' ? 'bg-blue-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {tournament.status === 'ACTIVE' ? 'Ativo' :
                             tournament.status === 'COMPLETED' ? 'Finalizado' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {tournament.teams?.length || 0} times
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(tournament.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                              onClick={() => handleEditTournament(tournament.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                              onClick={() => handleDeleteTournament(tournament.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Pagamentos */}
          <TabsContent value="payments" className="space-y-4">
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className="text-white">Gerenciar Pagamentos</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize e aprove pagamentos de times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Time</TableHead>
                      <TableHead className="text-gray-300">Campeonato</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">
                          {payment.team?.name || '-'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {payment.tournament?.name || '-'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          R$ {payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <span className={`px-2 py-1 rounded text-xs ${
                            payment.status === 'APPROVED' ? 'bg-green-600 text-white' :
                            payment.status === 'REJECTED' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {payment.status === 'APPROVED' ? 'Aprovado' :
                             payment.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                            onClick={() => handleApprovePayment(payment.id)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectPayment(payment.id)}
                          >
                            Rejeitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal para exibir membros do time */}
      <Dialog open={teamMembersDialogOpen} onOpenChange={setTeamMembersDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Membros do Time: {selectedTeamMembers?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeamMembers && (
            <div className="space-y-4">
              {/* Informações do Time */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">Informações do Time</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Nome:</span>
                    <p className="text-white font-medium">{selectedTeamMembers.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <p className={`font-medium ${
                      selectedTeamMembers.status === 'APPROVED' ? 'text-green-400' :
                      selectedTeamMembers.status === 'REJECTED' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedTeamMembers.status === 'APPROVED' ? 'Aprovado' :
                       selectedTeamMembers.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Criado em:</span>
                    <p className="text-white">
                      {new Date(selectedTeamMembers.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total de Membros:</span>
                    <p className="text-white font-medium">{selectedTeamMembers.members?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Informações do Líder */}
              {selectedTeamMembers.leader && (
                <div className="bg-gradient-to-r from-yellow-800/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-600/30">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Líder do Time
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedTeamMembers.leader.name?.charAt(0) || selectedTeamMembers.leader.nickname?.charAt(0) || 'L'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">
                        {selectedTeamMembers.leader.name || selectedTeamMembers.leader.nickname || 'Nome não disponível'}
                      </p>
                      <p className="text-yellow-300 text-sm">{selectedTeamMembers.leader.email}</p>
                      {selectedTeamMembers.leader.steamId && (
                        <p className="text-gray-400 text-sm">Steam ID: {selectedTeamMembers.leader.steamId}</p>
                      )}
                      {selectedTeamMembers.leader.currentEloGC && (
                        <p className="text-green-400 text-sm">Elo atual: {selectedTeamMembers.leader.currentEloGC}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Membros */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Membros</h3>
                {selectedTeamMembers.members && selectedTeamMembers.members.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTeamMembers.members.map((member: any, index: number) => {
                      const isLeader = selectedTeamMembers.leader && member.user.id === selectedTeamMembers.leader.id;
                      return (
                        <div 
                          key={member.id} 
                          className={`p-3 rounded-lg flex items-center justify-between ${
                            isLeader 
                              ? 'bg-gradient-to-r from-yellow-800/30 to-yellow-600/30 border border-yellow-600/50' 
                              : 'bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isLeader ? 'bg-yellow-600' : 'bg-blue-600'
                            }`}>
                              {isLeader && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                              {!isLeader && (
                                <span className="text-white font-bold">
                                  {member.user?.name?.charAt(0) || member.user?.nickname?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className={`font-medium ${isLeader ? 'text-yellow-300' : 'text-white'}`}>
                                  {member.user?.name || member.user?.nickname || 'Nome não disponível'}
                                </p>
                                {isLeader && (
                                  <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    LÍDER
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">{member.user?.email}</p>
                              {member.user?.steamId && (
                                <p className="text-gray-400 text-xs">Steam: {member.user.steamId}</p>
                              )}
                              {member.user?.currentEloGC && (
                                <p className="text-green-400 text-xs">Elo: {member.user.currentEloGC}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">
                              Ingressou em: {new Date(member.createdAt || member.joinedAt || selectedTeamMembers.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">Nenhum membro encontrado</p>
                )}
              </div>

              {/* Informações de Pagamento (se disponível) */}
              {selectedTeamMembers.paymentProof && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-blue-400">Informações de Pagamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Status do Pagamento:</span>
                      <p className={`font-medium ${
                        selectedTeamMembers.paymentStatus === 'APPROVED' ? 'text-green-400' :
                        selectedTeamMembers.paymentStatus === 'REJECTED' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {selectedTeamMembers.paymentStatus === 'APPROVED' ? 'Aprovado' :
                         selectedTeamMembers.paymentStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Comprovante:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                        onClick={() => window.open(selectedTeamMembers.paymentProof, '_blank')}
                      >
                        Ver Comprovante
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTeamMembersDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar torneio */}
      <Dialog open={editTournamentDialogOpen} onOpenChange={setEditTournamentDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Editar Torneio
            </DialogTitle>
          </DialogHeader>
          
          {selectedTournament && (
            <form onSubmit={handleUpdateTournament} className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-300">Nome do Torneio</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedTournament.name}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-game" className="text-gray-300">Jogo</Label>
                <select
                  id="edit-game"
                  name="game"
                  defaultValue={selectedTournament.game}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                >
                  <option value="CS2">Counter-Strike 2</option>
                  <option value="VALORANT">Valorant</option>
                  <option value="LEAGUE_OF_LEGENDS">League of Legends</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-gray-300">Preço (R$)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={selectedTournament.price}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-maxTeams" className="text-gray-300">Máx. Times</Label>
                  <Input
                    id="edit-maxTeams"
                    name="maxTeams"
                    type="number"
                    min="2"
                    max="64"
                    defaultValue={selectedTournament.maxTeams}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-prizePool" className="text-gray-300">Premiação (R$)</Label>
                <Input
                  id="edit-prizePool"
                  name="prizePool"
                  type="number"
                  step="0.01"
                  defaultValue={selectedTournament.prizePool}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status" className="text-gray-300">Status</Label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={selectedTournament.status}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                >
                  <option value="UPCOMING">Próximo</option>
                  <option value="ONGOING">Em Andamento</option>
                  <option value="COMPLETED">Finalizado</option>
                </select>
              </div>
              
              <DialogFooter className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditTournamentDialogOpen(false);
                    setSelectedTournament(null);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Atualizar Torneio
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}