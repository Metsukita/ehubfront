'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EditableMemberSlot } from '@/components/EditableMemberSlot';
import AddMemberForm from '@/components/AddMemberForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Trophy, Trash2, ArrowLeft, Loader2, UserPlus, CreditCard, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAlert } from '@/components/ui/alert-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import QRCode from 'qrcode';

// Função utilitária para exibir o nome do jogo
function formatGameName(game: string) {
  switch (game) {
    case 'VALORANT':
      return 'Valorant';
    case 'CS2':
      return 'CS2';
    case 'LEAGUE_OF_LEGENDS':
      return 'League of Legends';
    default:
      return game.replace('_', ' ');
  }
}

export default function TeamManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showSuccess, showError } = useAlert();
  
  const [team, setTeam] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [membersFull, setMembersFull] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  const teamId = params.teamId as string;

  // Verificar se o time está inscrito em algum torneio
  const activeTournaments = (registeredTeams ?? [])
    .filter((rt: any) => rt.teams?.some((t: any) => t.id === teamId))
    .map((rt: any) => tournaments.find((t: any) => t.id === rt.tournamentId))
    .filter(Boolean);
  const teamHasActiveTournaments = activeTournaments.length > 0;

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do time
      const teamResponse = await fetch(`http://localhost:3001/api/teams/${teamId}`);
      if (!teamResponse.ok) {
        showError('Time não encontrado');
        router.push('/app');
        return;
      }
      const teamData = await teamResponse.json();

      // Buscar membros completos e mesclar nos dados do time
      let membersFullData: any[] = [];
      try {
        const membersResponse = await fetch(`http://localhost:3001/api/teams/${teamId}/members`);
        if (membersResponse.ok) {
          membersFullData = await membersResponse.json();
        }
      } catch {}
      setMembersFull(membersFullData);

      // Mesclar dados completos no owner
      if (membersFullData.length > 0) {
        const fullOwner = membersFullData.find((m) => m.email === teamData.owner.email);
        if (fullOwner) {
          teamData.owner = { ...teamData.owner, ...fullOwner };
        }
        // Mesclar dados completos nos membros
        teamData.members = (teamData.members || []).map((member: any) => {
          const full = membersFullData.find((m) => m.email === member.user.email);
          return full ? { ...member, user: { ...member.user, ...full } } : member;
        });
      }
      setTeam(teamData);
      setIsOwner(teamData.owner.email === session?.user?.email);

      // Carregar torneios
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
        setRegisteredTeams(allTeamsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados do time');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTournament = async (tournamentId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      
      if (response.ok) {
        showSuccess('Inscrição solicitada com sucesso! Aguarde aprovação do administrador.');
        loadTeamData(); // Recarregar dados
      } else {
        const error = await response.json();
        showError(error.error || 'Erro ao inscrever time');
      }
    } catch (error) {
      showError('Erro ao inscrever time');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTournament = async (tournamentId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tournaments/${tournamentId}/register/${teamId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showSuccess('Inscrição cancelada com sucesso!');
        loadTeamData(); // Recarregar dados
      } else {
        const error = await response.json();
        showError(error.error || 'Erro ao cancelar inscrição');
      }
    } catch (error) {
      showError('Erro ao cancelar inscrição');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (teamHasActiveTournaments) {
      showError('Saia dos torneios antes de excluir o time');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showSuccess('Time excluído com sucesso!');
        router.push('/app');
      } else {
        const error = await response.json();
        showError(error.error || 'Erro ao excluir time');
      }
    } catch (error) {
      showError('Erro ao excluir time');
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReserveSlot = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
        
        // Gerar QR code se houver pixCode
        if (data.pixCode) {
          await generateQRCode(data.pixCode);
        }
        
        setShowPaymentDialog(true);
        showSuccess('QR Code PIX gerado com sucesso!');
      } else {
        const error = await response.json();
        showError(error.error || 'Erro ao gerar pagamento');
      }
    } catch (error) {
      showError('Erro ao processar pagamento');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Código PIX copiado para a área de transferência!');
    } catch (error) {
      showError('Erro ao copiar código PIX');
    }
  };

  const generateQRCode = async (pixCode: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(pixCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      showError('Erro ao gerar QR Code');
    }
  };

  useEffect(() => {
    if (teamId && session?.user?.email) {
      loadTeamData();
    }
  }, [teamId, session]);

  useEffect(() => {
    // Limpar QR code quando o modal fechar
    if (!showPaymentDialog) {
      setQrCodeDataUrl('');
    }
  }, [showPaymentDialog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Time não encontrado</h1>
          <Button onClick={() => router.push('/app')}>Voltar</Button>
        </div>
      </div>
    );
  }

  const safeTournaments = tournaments ?? [];
  const safeRegisteredTeams = registeredTeams ?? [];



  return (
    <>
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Tem certeza que deseja excluir o time?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta ação <b>não pode ser desfeita</b> e irá remover todos os dados do time <b>{team?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          {teamHasActiveTournaments && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Exclusão bloqueada</AlertTitle>
              <AlertDescription>
                Seu time está inscrito nos seguintes torneios:
                <ul className="list-disc ml-5 mt-2">
                  {activeTournaments.map((t: any) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
                <span className="block mt-2">
                  Saia dos torneios antes de excluir o time.
                </span>
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={actionLoading || teamHasActiveTournaments}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Excluir Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400">Reservar Vaga - R$ 150,00</DialogTitle>
            <DialogDescription className="text-gray-400">
              Taxa de inscrição (50% do valor total). Após o pagamento, sua vaga estará garantida.
            </DialogDescription>
          </DialogHeader>
          
          {paymentData && (
            <div className="space-y-4">
              {/* QR Code Area */}
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {qrCodeDataUrl ? (
                    <div className="w-48 h-48 flex items-center justify-center mb-2">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code PIX" 
                        className="max-w-full max-h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-600 text-sm mb-2">
                      {paymentData?.isDevelopment ? (
                        <>
                          🔧 Modo Desenvolvimento
                          <br />
                          QR Code Simulado
                        </>
                      ) : (
                        <>
                          Gerando QR Code...
                          <br />
                          <Loader2 className="h-8 w-8 animate-spin mt-2 mx-auto" />
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-gray-600 text-xs">
                    {paymentData?.isDevelopment 
                      ? 'Simulação - Use o botão abaixo para testar' 
                      : 'Escaneie com o app do seu banco'
                    }
                  </p>
                </div>
              </div>

              {/* Valor e informações */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Valor:</span>
                  <span className="text-green-400 font-bold text-lg">R$ 150,00</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Time:</span>
                  <span className="text-white">{team?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">ID do Pagamento:</span>
                  <span className="text-gray-400 text-sm">{paymentData.paymentId?.slice(-8)}</span>
                </div>
              </div>

              {/* Código Copia e Cola */}
              <div className="space-y-2">
                <Label className="text-white">Código PIX Copia e Cola:</Label>
                <div className="flex gap-2">
                  <Input
                    value={paymentData.pixCode || ''}
                    readOnly
                    className="bg-gray-600 border-gray-500 text-white text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentData.pixCode || '')}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Instruções:</strong>
                  <br />
                  {paymentData.isDevelopment ? (
                    <>
                      • <strong>MODO DESENVOLVIMENTO</strong>
                      <br />
                      • Este é um pagamento simulado
                      <br />
                      • Use o botão "Simular Pagamento" para testar
                      <br />
                      • Não é necessário pagar realmente
                    </>
                  ) : (
                    <>
                      • Escaneie o QR Code ou copie o código PIX
                      <br />
                      • Efetue o pagamento em qualquer banco
                      <br />
                      • O status será atualizado automaticamente
                      <br />
                      • Prazo: 30 minutos para pagamento
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
            >
              Fechar
            </Button>
            {paymentData?.isDevelopment && (
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const response = await fetch(`http://localhost:3001/api/teams/${teamId}/payment/simulate-approval`, {
                      method: 'POST'
                    });
                    if (response.ok) {
                      showSuccess('Pagamento simulado aprovado!');
                      setShowPaymentDialog(false);
                      loadTeamData();
                    } else {
                      showError('Erro ao simular pagamento');
                    }
                  } catch (error) {
                    showError('Erro ao simular pagamento');
                  }
                }}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Simular Pagamento
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700"
            >
              Verificar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/app')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold">{team.name.charAt(0)}</span>
                    </div>
                  )}
                  {team.name}
                </h1>
                <p className="text-gray-400 mt-1">
                  {formatGameName(team.game)} • {isOwner ? 'Você é o líder' : `Líder: ${team.owner.name}`}
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={handleReserveSlot}
                  disabled={actionLoading || team.paymentStatus === 'PAID'}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {team.paymentStatus === 'PAID' ? 'Vaga Reservada' : 'Reservar Vaga'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Time
                </Button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="tournaments">Torneios</TabsTrigger>
              <TabsTrigger value="settings" disabled={!isOwner}>Configurações</TabsTrigger>
            </TabsList>

            {/* Aba Membros */}
            <TabsContent value="members" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membros do Time
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Máximo 5 jogadores por time ({team.members.length + 1}/5)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Líder do time */}
                    <EditableMemberSlot
                      key={team.owner.email}
                      member={{
                        user: {
                          name: team.owner.name,
                          email: team.owner.email,
                          steamId: team.owner.steamId,
                          whatsapp: team.owner.whatsapp,
                          currentEloGC: team.owner.currentEloGC,
                          peakRankFaceit: team.owner.peakRankFaceit,
                          instagram: team.owner.instagram,
                        },
                        isLeader: true,
                      }}
                      teamId={team.id}
                      onUpdate={loadTeamData}
                      showSuccess={showSuccess}
                      showError={showError}
                      setLoading={setActionLoading}
                      loading={actionLoading}
                      isOwner={isOwner}
                    />

                    {/* Membros existentes */}
                    {team.members.map((member: any, index: number) => (
                      <EditableMemberSlot
                        key={member.user.email}
                        member={{
                          ...member,
                          user: {
                            ...member.user,
                            steamId: member.user.steamId,
                            whatsapp: member.user.whatsapp,
                            currentEloGC: member.user.currentEloGC,
                            peakRankFaceit: member.user.peakRankFaceit,
                            instagram: member.user.instagram,
                          },
                          isLeader: false,
                        }}
                        teamId={team.id}
                        onUpdate={loadTeamData}
                        showSuccess={showSuccess}
                        showError={showError}
                        setLoading={setActionLoading}
                        loading={actionLoading}
                        isOwner={isOwner}
                      />
                    ))}
                    
                    {/* Adicionar novo membro */}
                    {isOwner && team.members.length < 4 && (
                      <AddMemberForm 
                        teamId={team.id} 
                        onUpdate={loadTeamData} 
                        showSuccess={showSuccess} 
                        showError={showError} 
                        setLoading={setActionLoading} 
                        loading={actionLoading} 
                      />
                    )}

                    {/* Slots vazios */}
                    {Array.from({ length: Math.max(0, 4 - team.members.length - (isOwner && team.members.length < 4 ? 1 : 0)) }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg opacity-50">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-400">?</span>
                        </div>
                        <p className="text-gray-400">Slot disponível</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Torneios */}
            <TabsContent value="tournaments" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Torneios Disponíveis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Torneios com inscrições abertas para {formatGameName(team.game)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeTournaments.length === 0 ? (
                      <div className="text-center py-12">
                        <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhum torneio disponível no momento</p>
                      </div>
                    ) : (
                      safeTournaments
                        .filter((tournament: any) => tournament.game === team.game)
                        .map((tournament: any) => {
                          const tournamentTeams = safeRegisteredTeams.find((rt: any) => rt.tournamentId === tournament.id);
                          const isTeamRegistered = tournamentTeams?.teams?.some((t: any) => t.id === team.id);
                          return (
                            <Card key={tournament.id} className="bg-gray-700 border-gray-600">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-white font-semibold text-xl mb-2">{tournament.name}</h4>
                                    <div className="flex gap-2 mb-3">
                                      <Badge>{formatGameName(tournament.game)}</Badge>
                                      <Badge variant="outline">Inscrições Abertas</Badge>
                                      {tournament.prizePool && (
                                        <Badge variant="secondary">R$ {tournament.prizePool.toLocaleString()}</Badge>
                                      )}
                                      {tournamentTeams && (
                                        <Badge variant="outline">{tournamentTeams.total}/{tournamentTeams.maxTeams} times</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-gray-400 mb-4">
                                  {tournament.description || 'Primeiro campeonato oficial da plataforma com premiações em dinheiro'}
                                </p>
                                
                                {tournament.startDate && tournament.endDate && (
                                  <p className="text-gray-500 text-sm mb-4">
                                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                                  </p>
                                )}
                                
                                {/* Times Inscritos */}
                                {tournamentTeams && tournamentTeams.teams && tournamentTeams.teams.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-gray-300 text-sm mb-3">Times Inscritos:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {tournamentTeams.teams.map((registeredTeam: any) => (
                                        <div key={registeredTeam.id} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                                          {registeredTeam.logoUrl ? (
                                            <img src={registeredTeam.logoUrl} alt={registeredTeam.name} className="w-6 h-6 rounded" />
                                          ) : (
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                              <span className="text-white text-xs font-bold">{registeredTeam.name.charAt(0)}</span>
                                            </div>
                                          )}
                                          <span className="text-white text-sm">{registeredTeam.name}</span>
                                          <Badge variant="outline" className="text-xs ml-auto">
                                            {registeredTeam.registrationStatus === 'PENDING' ? 'Aguardando' : 'Aprovado'}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {isOwner && (
                                  <div className="flex gap-2">
                                    {isTeamRegistered ? (
                                      <>
                                        <Button size="sm" variant="outline" disabled>
                                          Inscrição Solicitada
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          onClick={() => handleLeaveTournament(tournament.id)} 
                                          disabled={actionLoading}
                                        >
                                          {actionLoading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Cancelando...
                                            </>
                                          ) : (
                                            'Cancelar Inscrição'
                                          )}
                                        </Button>
                                      </>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleRegisterTournament(tournament.id)} 
                                        disabled={actionLoading || (tournamentTeams?.total >= tournamentTeams?.maxTeams)}
                                      >
                                        {actionLoading ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Inscrevendo...
                                          </>
                                        ) : tournamentTeams?.total >= tournamentTeams?.maxTeams ? (
                                          'Torneio Lotado'
                                        ) : (
                                          'Inscrever Time'
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Configurações */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Configurações do Time</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie as configurações e informações do seu time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <UserPlus className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Em desenvolvimento</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Em breve você poderá editar informações do time, alterar logo e muito mais.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}