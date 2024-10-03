"use client";

import Image from "next/image";
import { BookType, User } from "../types/type";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 修正: next/navigationからインポート
import { getDetailBook } from "../lib/microcms/client";

type BookProps ={
  book: BookType
  isPurchased: boolean;
}

const Book = ({ book , isPurchased}: BookProps) => {

  const [showModal, setShowModal] = useState(false);

  const {data: session} = useSession();
  const user : User = session?.user as User;
  const router = useRouter();

  const startCheckout = async({params}: {params: {id:string}}) =>{
    const book = await getDetailBook(params.id);
    try{
      console.log(`${process.env.NEXT_PUBLIC_API_URL}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              title: book.title,
              price: book.price,
              userId: user?.id,
              bookId: book.id,
          }),
        })
        
        const responseData = await response.json();
        if(responseData){
         router.push(responseData.url);
        }else{
          console.log(responseData);
        }
    }catch(err:unknown){
        console.log(err);
    }
  };

  const handlePurchaseClick = () =>{
    if( isPurchased){
      alert("その商品は購入済み");
    }else{
      setShowModal(true);
    }
  };

  const handleCancel = () =>{
    setShowModal(false);
  };

  const handlePurchaseConfirm = () =>{
    if (session === undefined) return;

    if(!user){
      setShowModal(false);

      router.push("/login");
    }else{
      startCheckout({ params: { id: book.id } });
    }
  };

  return (
    <>
      {/* アニメーションスタイル */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center m-4">
        <a  onClick={handlePurchaseClick}  className="cursor-pointer shadow-2xl duration-300 hover:translate-y-1 hover:shadow-none">
          <Image
            priority
            src={book.thumbnail.url}
            alt={book.title}
            width={450}
            height={350}
            className="rounded-t-md"
          />
          <div className="px-4 py-4 bg-slate-100 rounded-b-md">
            <h2 className="text-lg font-semibold">{book.title}</h2>
            <p className="mt-2 text-lg text-slate-600">この本は○○...</p>
            <p className="mt-2 text-md text-slate-700">{book.price ?? 500}</p>
          </div>
        </a>
        {showModal && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-slate-900 bg-opacity-50 flex justify-center items-center modal">
          <div className="bg-white p-8 rounded-lg">
            <h3 className="text-xl mb-4">本を購入しますか？</h3>
            <button 
                onClick={handlePurchaseConfirm}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              購入する
            </button>
            <button 
                onClick={handleCancel} 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              キャンセル
            </button>
          </div>
        </div>
        )}
        
      </div>
    </>
  );
};

export default Book;
