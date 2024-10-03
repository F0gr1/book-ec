import { getServerSession } from "next-auth";
import Book from "./components/book";
import { getAllBooks } from "./lib/microcms/client";
import { BookType, Purchase, User } from "./types/type";
import { nextAuthOptions } from "./lib/nexr-auth/options";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Home() {

  const {contents} = await getAllBooks();
  const session = await getServerSession(nextAuthOptions);
  const user: User = session?.user as User;
  
  // purchaseBookdIds を初期化
  let purchaseBookdIds: string[] = [];

  if(user){
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/purchases/${user.id}`,
        { cache : "no-cache"} //SSR
    );

    const purhcasesData = await response.json();

    purchaseBookdIds = purhcasesData.map(
       (purhcasesBook: Purchase) => purhcasesBook.bookId
    )
  }

  return (
    <>
      <main className="flex flex-wrap justify-center items-center md:mt-32 mt-20">
        <h2 className="text-center w-full font-bold text-3xl mb-2">
          Book Commerce
        </h2>
        {contents.map((book: BookType) => (
          <Book key={book.id} book={book} isPurchased={purchaseBookdIds.includes(book.id)}/>
        ))}
      </main>
    </>
  );
}
