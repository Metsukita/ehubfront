// client/app/page.tsx
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { AuthenticationPage } from "@/components/AuthenticationPage";

export default async function Login() {
  const session = await getServerSession(authOptions);

  // Se o usuário já tiver uma sessão ativa
  if (session) {
    // Verificar se é o admin autorizado
    if (session.user?.email === 'pgsouza48@gmail.com') {
      redirect('/admin');
    } else {
      // Usuários regulares vão para a página principal do app
      redirect('/app');
    }
  }

  // Se não houver sessão, mostre a página de login.
  return <AuthenticationPage />;
}