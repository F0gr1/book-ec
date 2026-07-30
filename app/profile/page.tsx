
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../lib/nexr-auth/options";
import PurchaseProduct from "../components/PurchaseProduct";
import { getBookPreview } from "../lib/microcms/client";
import prisma from "../lib/prisma";
import { BookPreview } from "../types/type";

export default async function ProfilePage() {
  const session = await getServerSession(nextAuthOptions);
  const user = session?.user;

  if (!user?.id) {
    redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { bookId: true },
  });
  const detailBooks: BookPreview[] = await Promise.all(
    purchases.map((purchase) => getBookPreview(purchase.bookId)),
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">プロフィール</h1>

      <div className="bg-white shadow-md rounded p-4">
        <div className="flex items-center">
            <Image
              priority
              src={user.image || "/default_icon.png"}
              alt="user profile_icon"
            width={60}
            height={60}
            className="rounded-t-md"
          />
          <h2 className="text-lg ml-4 font-semibold">お名前：{user.name}</h2>
        </div>
      </div>

      <span className="font-medium text-lg mb-4 mt-4 block">購入した記事</span>
      <div className="flex items-center gap-6">
        {detailBooks.map((detailBook) => (
          <PurchaseProduct key={detailBook.id} book={detailBook} />
        ))}
      </div>
    </div>
  );
}
