import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function EditableMemberSlot({ member, teamId, onUpdate, showSuccess, showError, setLoading, loading, isOwner }: any) {
  const [editMode, setEditMode] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [form, setForm] = useState({
    steam: member.user.steamId || '',
    whatsapp: member.user.whatsapp || '',
    gc: member.user.currentEloGC || '',
    faceit: member.user.peakRankFaceit || '',
    instagram: member.user.instagram || '',
  });

  // Atualiza o form se o membro mudar (ex: ao recarregar membros do backend)
  useEffect(() => {
    setForm({
      steam: member.user.steamId || '',
      whatsapp: member.user.whatsapp || '',
      gc: member.user.currentEloGC || '',
      faceit: member.user.peakRankFaceit || '',
      instagram: member.user.instagram || '',
    });
  }, [member.user.steamId, member.user.whatsapp, member.user.currentEloGC, member.user.peakRankFaceit, member.user.instagram]);
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/members/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: member.user.email,
          ...form
        }),
      });
      if (!response.ok) throw new Error('Erro ao salvar dados do jogador');
      showSuccess('Dados do jogador salvos!');
      setEditMode(false);
      onUpdate();
    } catch (err: any) {
      showError(err.message || 'Erro ao salvar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/members/${member.user.email}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover membro');
      }
      showSuccess('Membro removido com sucesso!');
      setShowRemoveDialog(false);
      onUpdate();
    } catch (err: any) {
      showError(err.message || 'Erro ao remover membro.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Dialog de confirmação de remoção */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Remover membro do time</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja remover <b>{member.user.name}</b> do time? 
              Esta ação não pode ser desfeita e o slot ficará disponível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveDialog(false)} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`border-b border-gray-600 pb-4`}>
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <div className={`w-6 h-6 ${member.isLeader ? 'bg-yellow-500' : 'bg-blue-500'} rounded-full flex items-center justify-center`}>
            <span className={`text-xs font-bold ${member.isLeader ? 'text-black' : 'text-white'}`}>{member.isLeader ? 'L' : 'M'}</span>
          </div>
          {member.user.name} {member.isLeader && <span className="ml-2 text-xs text-yellow-400">(Líder)</span>}
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => setEditMode((v: boolean) => !v)}>
              {editMode ? 'Cancelar' : 'Editar'}
            </Button>
            {!member.isLeader && isOwner && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => setShowRemoveDialog(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`member-${member.user.email}-steam`}>SteamID</Label>
          <Input
            id={`member-${member.user.email}-steam`}
            name="steam"
            value={form.steam}
            onChange={handleChange}
            placeholder="76561198..."
            className="bg-gray-600 border-gray-500"
            disabled={!editMode}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`member-${member.user.email}-whatsapp`}>WhatsApp</Label>
          <Input
            id={`member-${member.user.email}-whatsapp`}
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className="bg-gray-600 border-gray-500"
            disabled={!editMode}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`member-${member.user.email}-gc`}>Elo GamersClub</Label>
          <Input
            id={`member-${member.user.email}-gc`}
            name="gc"
            value={form.gc}
            onChange={handleChange}
            placeholder="Global Elite"
            className="bg-gray-600 border-gray-500"
            disabled={!editMode}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`member-${member.user.email}-faceit`}>Peak Rank Faceit</Label>
          <Input
            id={`member-${member.user.email}-faceit`}
            name="faceit"
            value={form.faceit}
            onChange={handleChange}
            placeholder="Level 10"
            className="bg-gray-600 border-gray-500"
            disabled={!editMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`member-${member.user.email}-instagram`}>Instagram</Label>
          <Input
            id={`member-${member.user.email}-instagram`}
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="@usuario"
            className="bg-gray-600 border-gray-500"
            disabled={!editMode}
          />
        </div>
      </div>
      {editMode && (
        <Button size="sm" className="mt-3" onClick={handleSave} disabled={loading}>
          Salvar Dados
        </Button>
      )}
      </div>
    </>
  );
}
