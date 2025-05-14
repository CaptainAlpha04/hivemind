// Filepath: c:\NUST\Semester 4\Web Technologies\hivemind\server\auth.config.mjs
import Credentials from "@auth/express/providers/credentials";
import Google from "@auth/express/providers/google";
// Ensure you have AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in your .env file

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true, // Required for Vercel deployment, review for your environment
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });
          
          const data = await response.json();

          if (!response.ok) {
            console.log("Login failed via @auth/express Credentials:", data.message);
            return null; 
          }
          if (data.user) {
            return { id: data.user.id, email: data.user.email, name: data.user.name, ...data.user };
          }
          return null;
        } catch (error) {
          console.error("Error in @auth/express Credentials authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id || token.sub;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
