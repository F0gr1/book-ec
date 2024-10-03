import { NextAuthOptions } from "next-auth";
import GitHubProvides from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../prisma";

export const nextAuthOptions : NextAuthOptions ={
    debug: false,
    providers:[
        GitHubProvides({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: ({session , user}) =>{
            return {
                ...session,
                user:{
                    ...session.user,
                    id: user.id

                }
            }
        }
    }
}