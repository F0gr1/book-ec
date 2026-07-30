import "server-only";

import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/lib/nexr-auth/options";

export const getCurrentUserId = async () => {
    const session = await getServerSession(nextAuthOptions);
    return session?.user?.id ?? null;
};
