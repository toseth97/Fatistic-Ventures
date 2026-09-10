import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// ---------------------------------------------------------------------------
// NextAuth v5 (Google OAuth / OpenID Connect).
// - Sessions are stored in httpOnly, SameSite=Lax cookies (JWT strategy).
// - The Google profile is upserted into MongoDB; the DB user id is carried in
//   the JWT so account pages and orders can be scoped by user.
// - Google passwords are never collected or stored anywhere.
// ---------------------------------------------------------------------------

async function upsertGoogleUser(profile) {
    await connectDB();
    const googleId = String(profile?.sub || "").trim();
    const email = String(profile?.email || "").trim().toLowerCase();
    const query = googleId ? { googleId } : { email };
    if (!googleId && !email) return null;
    const user = await User.findOneAndUpdate(
        query,
        {
            $set: {
                ...(googleId && { googleId }),
                email: email || undefined,
                name: String(profile?.name || email || "Guest").slice(0, 120),
                picture: String(profile?.picture || "").slice(0, 1000),
                locale: String(profile?.locale || "").slice(0, 20),
                authType: "google",
                provider: "google",
                lastLoginAt: new Date(),
            },
            $setOnInsert: { googleId: googleId || `google-${email}`, sessionVersion: 0 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    return user;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: { params: { prompt: "select_account" } },
        }),
    ],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24,
    },
    cookies: {
        sessionToken: {
            options: {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            },
        },
    },
    callbacks: {
        signIn() {
            // The ID token was already validated by NextAuth against Google.
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (account && user) {
                let dbUser = null;
                try {
                    dbUser = await upsertGoogleUser(profile || user);
                } catch (e) {
                    console.error("[auth] upsert failed", e?.message);
                }
                if (!dbUser) return token;
                token.userId = String(dbUser._id);
                token.role = dbUser.role || "user";
                token.picture = dbUser.picture || user.image || "";
                token.name = dbUser.name || user.name || "";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId || null;
                session.user.role = token.role || "user";
                session.user.image = token.picture || session.user.image || "";
                session.user.name = token.name || session.user.name || "";
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    trustHost: true,
});

export { upsertGoogleUser };
