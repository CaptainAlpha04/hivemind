import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Return null instead of throwing an error
        }

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
            console.log("Login failed:", data.message);
            
            // Don't throw errors, just store the error type and return null
            if (data.message?.includes('verify')) {
              // Store the error type in a global variable or other state mechanism
              console.log("Email not verified");
            }
            
            return null; // Return null for authentication failure
          }

          // Authentication successful
          return data.user;
        } catch (error) {
          console.error("Login error:", error);
          return null; // Return null for any errors
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account}) {
      // Only handle OAuth providers here
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/oauth-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider
            })
          });
          
          return response.ok;
        } catch (error) {
          console.error("Error syncing OAuth user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Store the access token if it exists (for OAuth providers)
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // For credential login, simulate an access token using the session token
      // This is a simple approach; in a production app, you might want to generate a proper JWT
      if (!token.accessToken) {
        token.accessToken = token.jti || `auth-token-${Date.now()}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Include the access token in the session
      if (token.accessToken) {
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to /mainpage after sign-in
      return baseUrl + "/mainpage";
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // Make sure this is set correctly
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);