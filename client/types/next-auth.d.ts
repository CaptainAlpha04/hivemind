import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string  // Add accessToken to the user object
    }
  }

  /**
   * Extending the built-in JWT types
   */
  interface JWT {
    id?: string
    accessToken?: string  // Add accessToken to the JWT
  }
}

// Extending the built-in User types
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    accessToken?: string // Add accessToken to the JWT
  }
}
