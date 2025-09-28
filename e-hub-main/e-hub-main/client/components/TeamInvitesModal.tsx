// client/components/TeamInvitesModal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, Check, X, Loader2 } from 'lucide-react';

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

interface TeamInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invites: TeamInvite[];
  onInviteProcessed: () => void;
}

export function TeamInvitesModal({ isOpen, onClose, invites, onInviteProcessed }: TeamInvitesModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleInviteAction = async (inviteId: string, action: 'accept' | 'decline') => {
    setLoading(inviteId);
    
    try {
      const response = await fetch(`http://localhost:3001/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar convite');
      }

      onInviteProcessed();
      
    } catch (error) {
      console.error('Erro ao processar convite:', error);
      alert('Erro ao processar convite. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const formatGameName = (game: string) => {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites de Times ({invites.length})
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Você foi convidado para participar dos seguintes times
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {invites.length === 0 ? (
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-white mb-2">
                  Nenhum convite pendente
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Você não tem convites de times no momento
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            invites.map((invite) => (
              <Card key={invite.id} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {invite.team.name}
                      </CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="secondary">
                          {formatGameName(invite.team.game)}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">
                        <div className="space-y-1">
                          <p>
                            <span className="font-medium">Líder do time:</span> {invite.team.owner.name}
                          </p>
                          <p>
                            <span className="font-medium">Convite enviado por:</span> {invite.sender.name}
                          </p>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInviteAction(invite.id, 'decline')}
                      disabled={loading === invite.id}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      {loading === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Recusar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleInviteAction(invite.id, 'accept')}
                      disabled={loading === invite.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aceitar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}