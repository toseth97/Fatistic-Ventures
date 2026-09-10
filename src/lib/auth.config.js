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
            // Refresh from Google on each sign-in so a changed Google photo updates.
            const gPicture = String(profile?.picture || user?.image || "").slice(0, 1000);
            const gName = String(profile?.name || user?.name || "").slice(0, 120);
            if (account && user) {
                let dbUser = null;
                try {
                    dbUser = await upsertGoogleUser(profile || user);
                } catch (e) {
                    console.error("[auth] upsert failed", e?.message);
                }
                if (!dbUser) {
                    // DB unavailable — still carry the Google identity in the token.
                    if (gPicture) {
                        token.picture = gPicture;
                        token.image = gPicture;
                    }
                    if (gName) token.name = gName;
                    return token;
                }
                token.userId = String(dbUser._id);
                token.role = dbUser.role || "user";
                // NextAuth convention is `image`; our app also reads `picture`.
                // Store under both keys so either accessor always works.
                const pic = dbUser.picture || gPicture || user.image || "";
                token.picture = pic;
                token.image = pic;
                token.name = dbUser.name || gName || user.name || "";
            } else if (gPicture && token.picture !== gPicture) {
                // Re-sign-in with same session: pick up a changed Google photo.
                token.picture = gPicture;
                token.image = gPicture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId || null;
                session.user.role = token.role || "user";
                // Expose the Google photo under both keys.
                const pic = token.picture || token.image || session.user.image || "";
                session.user.image = pic;
                session.user.picture = pic;
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
