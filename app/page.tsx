import { getServerSession } from "next-auth";
import Book from "./components/book";
import { getAllBooks } from "./lib/microcms/client";
import { BookPreview } from "./types/type";
import { nextAuthOptions } from "./lib/nexr-auth/options";
import prisma from "./lib/prisma";

export default async function Home() {
  const { contents } = await getAllBooks();
  const session = await getServerSession(nextAuthOptions);
  let purchasedBookIds: string[] = [];

  if (session?.user?.id) {
    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id },
      select: { bookId: true },
    });
    purchasedBookIds = purchases.map((purchase) => purchase.bookId);
  }

  return (
    <>
      <main className="flex flex-wrap justify-center items-center md:mt-32 mt-20">
        <h2 className="text-center w-full font-bold text-3xl mb-2">
          Book Commerce
        </h2>
        {contents.map((book: BookPreview) => (
          <Book key={book.id} book={book} isPurchased={purchasedBookIds.includes(book.id)} />
        ))}
      </main>
    </>
  );
}
