'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit, Save, Trophy, Medal, ShieldCheck, Users, XCircle, CheckCircle } from 'lucide-react';
type Invite = {
  id: string;
  team: {
    id: string;
    name: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
};
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Icons } from '@/components/icons';

type Player = {
  id: string;
  name: string | null;
  email: string | null;
  nickname: string;
  bio: string | null;
  phone: string | null;
  image: string | null;
  teamId: string | null;
  rank: string | null;
  _count: {
    achievements: number;
  };
};

type Team = {
  id: string;
  name: string;
};

export default function PlayerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const nickname = params.nickname as string;

  const { status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/'); // Redireciona para o login se não estiver autenticado
    },
  });

  const [player, setPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Player>>({});

  useEffect(() => {
    if (!nickname) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [playerRes, teamsRes, invitesRes] = await Promise.all([
          fetch(`http://localhost:3001/api/players/${nickname}`),
          fetch('http://localhost:3001/api/teams'),
          fetch(`http://localhost:3001/api/players/${nickname}/invites`),
        ]);

        if (!playerRes.ok) throw new Error('Player not found');
        const playerData: Player = await playerRes.json();
        const teamsData: Team[] = teamsRes.ok ? await teamsRes.json() : [];
        let inviteData: Invite | null = null;
        if (invitesRes.ok) {
          const invites: Invite[] = await invitesRes.json();
          inviteData = invites.find(inv => inv.status === 'PENDING') || null;
        }
        setPlayer(playerData);
        setFormData(playerData);
        setTeams(teamsData);
        setPendingInvite(inviteData);
      } catch (error) {
        console.error(error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nickname, router]);

  const handleAcceptInvite = async () => {
    if (!pendingInvite) return;
    setInviteLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/invites/${pendingInvite.id}/accept`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao aceitar convite');
      setPendingInvite(null);
      router.refresh();
    } catch (error) {
      alert('Erro ao aceitar convite.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!pendingInvite) return;
    setInviteLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/invites/${pendingInvite.id}/decline`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao recusar convite');
      setPendingInvite(null);
    } catch (error) {
      alert('Erro ao recusar convite.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, teamId: value }));
  };

  const handleSave = async () => {
    if (!player) return;
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/players/${player.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamId: formData.teamId === 'none' ? null : formData.teamId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar');
      }
      if (response.ok) {
        router.refresh();
      }
      const updatedPlayer = await response.json();
      setIsEditing(false);

      // Se o nickname foi alterado, a URL precisa ser atualizada
      if (nickname !== updatedPlayer.nickname) {
        router.replace(`/players/${updatedPlayer.nickname}`);
      } else {
        // Se não, apenas atualiza os dados da página
        router.refresh();
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 pt-24">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Card de convite pendente */}
        {pendingInvite && (
          <Card className="bg-yellow-900/80 border-yellow-700 text-white mb-4">
            <CardHeader className="flex flex-row items-center gap-4">
              <Users className="h-6 w-6 text-yellow-400" />
              <div>
                <CardTitle>Convite para entrar no time</CardTitle>
                <CardDescription className="text-yellow-200">
                  Você foi convidado para o time <b>{pendingInvite.team.name}</b>.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={handleAcceptInvite} disabled={inviteLoading} className="gap-2 bg-green-700 hover:bg-green-800">
                <CheckCircle className="h-4 w-4" /> Aceitar
              </Button>
              <Button onClick={handleDeclineInvite} disabled={inviteLoading} variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" /> Recusar
              </Button>
            </CardContent>
          </Card>
        )}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-black/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campeonatos Ganhos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Dados de exemplo</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medalhas</CardTitle>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{player?._count.achievements || 0}</div>
              <p className="text-xs text-muted-foreground">Conquistas totais</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elo Atual</CardTitle>
              <Icons.valorant className="h-6 w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{player?.rank || 'Não definido'}</div>
              <p className="text-xs text-muted-foreground">Rank no Valorant</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Troféus</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Dados de exemplo</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/50 border-none">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={player?.image || 'https://cdn.discordapp.com/attachments/1255920914906742875/1413619751124729937/images.png?ex=68bc977c&is=68bb45fc&hm=116a11dc44bad7bc3045ae5aed7502b77a2888e04ba3c3dc67985c71d49680f7&'} // Use uma imagem padrão
                alt={player?.nickname || 'Player Avatar'}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary"
              />
              <div>
                <CardTitle className="text-2xl">{player?.nickname}</CardTitle>
                <CardDescription>{player?.name || 'Nome não informado'}</CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="icon" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" name="nickname" value={formData.nickname || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <Input id="image" name="image" value={formData.image || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rank">Rank (Elo)</Label>
                <Input id="rank" name="rank" value={formData.rank || ''} onChange={handleInputChange} readOnly={!isEditing} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Time</Label>
                {isEditing ? (
                  <Select onValueChange={handleSelectChange} value={formData.teamId || 'none'}>
                    <SelectTrigger id="team" className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Selecione um time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="none" className="focus:bg-gray-700 focus:text-white">Nenhum time</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id} className="focus:bg-gray-700 focus:text-white">{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input readOnly value={teams.find(t => t.id === player?.teamId)?.name || 'Nenhum time'} className="bg-transparent border-0 border-b border-gray-600 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
