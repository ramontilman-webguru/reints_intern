import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define the users array using environment variables
const users = [
  {
    id: "1",
    name: process.env.USER1_NAME,
    password: process.env.USER1_PASSWORD,
  },
  {
    id: "2",
    name: process.env.USER2_NAME,
    password: process.env.USER2_PASSWORD,
  },
  {
    id: "3",
    name: process.env.USER3_NAME,
    password: process.env.USER3_PASSWORD,
  },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Basic validation
        if (!credentials?.username || !credentials?.password) {
          console.error("[next-auth][error] Missing username or password");
          return null;
        }

        const user = users.find(
          (u) =>
            u.name === credentials.username &&
            u.password === credentials.password
        );

        if (user) {
          console.log(
            `[next-auth] Auth Success: User ${user.name} authorized.`
          );
          // V4 requires just the user object, fields are added to JWT/session via callbacks
          return { id: user.id, name: user.name };
        } else {
          console.warn(
            `[next-auth] Auth Failure: Invalid credentials for username: ${credentials.username}`
          );
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // Use JWT strategy for sessions
  session: {
    strategy: "jwt",
  },
  // Callbacks to include user ID in the session token
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from the token.
      if (session.user) {
        session.user.id = token.id; // Add id from token to session user object
      }
      return session;
    },
  },
  // Specify the custom login page
  pages: {
    signIn: "/login",
    error: "/api/auth/error", // Default error page, can be customized
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};

// Initialize and export the handler for Next.js App Router (v4 style)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const signIn = handler?.signIn;
export const signOut = handler?.signOut;
export const auth = handler?.auth;
