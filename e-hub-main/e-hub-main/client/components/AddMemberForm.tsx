import React, { useState } from "react";

interface AddMemberFormProps {
  teamId: string;
  onUpdate: () => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  teamId,
  onUpdate,
  showSuccess,
  showError,
  setLoading,
  loading,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error("Erro ao adicionar membro");
      showSuccess("Membro adicionado com sucesso!");
      setName("");
      setEmail("");
      onUpdate();
    } catch (err: any) {
      showError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-2 p-3 bg-gray-700 rounded-lg">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome do membro"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 px-2 py-1 rounded bg-gray-800 text-white"
          required
        />
        <input
          type="email"
          placeholder="Email do membro"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 px-2 py-1 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded disabled:opacity-60"
        disabled={loading}
      >
        Adicionar membro
      </button>
    </form>
  );
};

export default AddMemberForm;
