"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { useAlert } from "@/components/ui/alert-provider";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
  userEmail?: string | null;
}

export function CreateTeamModal({ isOpen, onClose, onTeamCreated, userEmail }: CreateTeamModalProps) {

  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState({
    name: "",
    logoUrl: "",
    game: "",
  });
  const { showSuccess, showError } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamData.name || !teamData.game) {
      showError("Nome do time e jogo são obrigatórios!");
      return;
    }
    setLoading(true);
    try {
      // Criar/buscar usuário
      const userResponse = await fetch("http://localhost:3001/api/users/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name: userEmail?.split("@")[0],
        }),
      });
      if (!userResponse.ok) {
        const errorData = await userResponse.text();
        throw new Error(`Erro ao criar usuário: ${errorData}`);
      }
      const user = await userResponse.json();
      // Criar o time
      const teamResponse = await fetch("http://localhost:3001/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...teamData,
          ownerId: user.id,
        }),
      });
      if (!teamResponse.ok) {
        const errorData = await teamResponse.text();
        throw new Error(`Erro ao criar time: ${errorData}`);
      }
      setTeamData({ name: "", logoUrl: "", game: "" });
      onTeamCreated();
      onClose();
      showSuccess("Time criado com sucesso!");
    } catch (error: any) {
      if (error.message.includes("fetch")) {
        showError("Erro de conexão: Verifique se o servidor está rodando na porta 3001");
      } else {
        showError(`Erro ao criar time: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTeamData({ name: "", logoUrl: "", game: "" });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Novo Time
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure as informações básicas do seu time
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nome do Time *</Label>
            <Input
              id="teamName"
              value={teamData.name}
              onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
              placeholder="Digite o nome do seu time"
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="game">Jogo *</Label>
            <Select value={teamData.game} onValueChange={(value) => setTeamData({ ...teamData, game: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Selecione o jogo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="VALORANT" disabled className="opacity-50 cursor-not-allowed">Valorant (em breve)</SelectItem>
                <SelectItem value="CS2" className="focus:bg-gray-700 focus:text-white">CS2</SelectItem>
                <SelectItem value="LEAGUE_OF_LEGENDS" disabled className="opacity-50 cursor-not-allowed">League of Legends (em breve)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo do Time (URL)</Label>
            <Input
              id="logoUrl"
              value={teamData.logoUrl}
              onChange={(e) => setTeamData({ ...teamData, logoUrl: e.target.value })}
              placeholder="https://exemplo.com/logo.png (opcional)"
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Time"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

           