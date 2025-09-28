// client/components/TeamManagementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { EditableMemberSlot } from './EditableMemberSlot';
import AddMemberForm from './AddMemberForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, UserPlus, Loader2, Trophy, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAlert } from '@/components/ui/alert-provider';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogDescription as ConfirmDialogDescription, DialogFooter as ConfirmDialogFooter } from '@/components/ui/dialog';

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

export function TeamManagementModal({
  isOpen,
  onClose,
  team,
  onUpdate,
  showSuccess,
  showError,
  loading,
  setLoading,
  tournaments,
  registeredTeams,
  handleRegisterTournament,
  handleLeaveTournament,
  confirmDeleteTeam,
  handleDeleteTeam,
  isOwner,
}: any) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const activeTournaments = (registeredTeams ?? [])
    .filter((rt: any) => rt.teams?.some((t: any) => t.id === team.id))
    .map((rt: any) => safeTournaments.find((t: any) => t.id === rt.tournamentId))
    .filter(Boolean);
  const teamHasActiveTournaments = activeTournaments.length > 0;

  useEffect(() => {
    if (team) {
      // Lógica para buscar dados do time, torneios, etc.
    }
  }, [team]);

  // Garante valor padrão para arrays
  const safeTournaments = tournaments ?? [];
  const safeRegisteredTeams = registeredTeams ?? [];

  if (!team) return null;
  return (
    <>
      <ConfirmDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <ConfirmDialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle className="text-red-400">Tem certeza que deseja excluir o time?</ConfirmDialogTitle>
            <ConfirmDialogDescription className="text-gray-400">
              Esta ação <b>não pode ser desfeita</b> e irá remover todos os dados do time <b>{team?.name}</b>.
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
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
          <ConfirmDialogFooter className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!teamHasActiveTournaments) {
                  confirmDeleteTeam();
                }
              }}
              disabled={loading || teamHasActiveTournaments}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Excluir Time
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciar Time - {team.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {isOwner ? 'Gerencie membros e inscrições do seu time' : 'Visualizar informações do time'}
                </DialogDescription>
              </div>
              {isOwner && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Time
                </Button>
              )}
            </div>
          </DialogHeader>
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="profile" disabled={!isOwner}>Perfil</TabsTrigger>
              <TabsTrigger value="tournaments">Torneios</TabsTrigger>
              <TabsTrigger value="invite" disabled={!isOwner}>Convidar</TabsTrigger>
            </TabsList>
            <TabsContent value="members" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Membros do Time</CardTitle>
                  <CardDescription className="text-gray-400">Máximo 5 jogadores por time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Líder do time (editável) */}
                    <EditableMemberSlot
                      key={team.owner.email}
                      member={{
                        user: {
                          name: team.owner.name,
                          email: team.owner.email,
                        },
                        isLeader: true,
                      }}
                      teamId={team.id}
                      onUpdate={onUpdate}
                      showSuccess={showSuccess}
                      showError={showError}
                      setLoading={setLoading}
                      loading={loading}
                    />
                    {/* Membros existentes */}
                    {team.members.map((member: any, index: number) => (
                      <EditableMemberSlot
                        key={member.user.email}
                        member={{ ...member, isLeader: false }}
                        teamId={team.id}
                        onUpdate={onUpdate}
                        showSuccess={showSuccess}
                        showError={showError}
                        setLoading={setLoading}
                        loading={loading}
                      />
                    ))}
                    {/* Adicionar novo membro */}
                    {isOwner && team.members.length < 4 && (
                      <AddMemberForm teamId={team.id} onUpdate={onUpdate} showSuccess={showSuccess} showError={showError} setLoading={setLoading} loading={loading} />
                    )}
                    {/* Slots vazios (apenas visual) */}
                    {Array.from({ length: 4 - team.members.length - 1 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg opacity-50">
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">?</span>
                        </div>
                        <p className="text-gray-400">Slot disponível</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tournaments" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
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
                  <div className="space-y-3">
                    {safeTournaments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Nenhum torneio disponível no momento</p>
                      </div>
                    ) : (
                      safeTournaments
                        .filter((tournament: any) => tournament.game === team.game) // Filtrar pelo jogo do time
                        .map((tournament: any) => {
                        const tournamentTeams = safeRegisteredTeams.find((rt: any) => rt.tournamentId === tournament.id);
                        const isTeamRegistered = tournamentTeams?.teams?.some((t: any) => t.id === team.id);
                        return (
                          <div key={tournament.id} className="bg-gray-600 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-2">{tournament.name}</h4>
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
                            <p className="text-gray-400 text-sm mb-3">
                              {tournament.description || 'Primeiro campeonato oficial da plataforma com premiações em dinheiro'}
                            </p>
                            {tournament.startDate && tournament.endDate && (
                              <p className="text-gray-500 text-xs mb-3">
                                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                              </p>
                            )}
                            {/* Times Inscritos */}
                            {tournamentTeams && tournamentTeams.teams && tournamentTeams.teams.length > 0 && (
                              <div className="mb-3">
                                <p className="text-gray-300 text-sm mb-2">Times Inscritos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {tournamentTeams.teams.map((registeredTeam: any) => (
                                    <div key={registeredTeam.id} className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded text-xs">
                                      {registeredTeam.logoUrl ? (
                                        <img src={registeredTeam.logoUrl} alt={registeredTeam.name} className="w-4 h-4 rounded" />
                                      ) : (
                                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">{registeredTeam.name.charAt(0)}</span>
                                        </div>
                                      )}
                                      <span className="text-white">{registeredTeam.name}</span>
                                      <Badge variant="outline" className="text-xs">
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
                                    <Button size="sm" variant="outline" disabled={loading}>
                                      Inscrição Solicitada
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleLeaveTournament(tournament.id)} disabled={loading}>
                                      {loading ? (
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
                                  <Button size="sm" onClick={() => handleRegisterTournament(tournament.id)} disabled={loading || (tournamentTeams?.total >= tournamentTeams?.maxTeams)}>
                                    {loading ? (
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
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="invite" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Convidar Jogador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-red-400 font-semibold text-lg">Convites indisponíveis</p>
                    <p className="text-gray-400 mt-2">Agora o líder do time deve adicionar os dados dos jogadores diretamente na aba Membros.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}