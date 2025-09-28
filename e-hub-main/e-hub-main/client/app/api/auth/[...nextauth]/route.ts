// client/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    // Configurando o provedor do Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // Você pode adicionar mais provedores aqui (GitHub, Facebook, etc.)
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }