"use client";

import Image from "next/image";
import { BookPreview } from "../types/type";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type BookProps = {
  book: BookPreview;
  isPurchased: boolean;
};

const Book = ({ book, isPurchased }: BookProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const startCheckout = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      const responseData = await response.json().catch(() => null);

      if (!response.ok || typeof responseData?.url !== "string") {
        throw new Error(responseData?.error || "購入手続きを開始できませんでした");
      }

      window.location.assign(responseData.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "購入手続きを開始できませんでした",
      );
      setIsSubmitting(false);
    }
  };

  const handlePurchaseClick = () => {
    if (isPurchased) {
      router.push(`/book/${book.id}`);
    } else {
      setError(null);
      setShowModal(true);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handlePurchaseConfirm = () => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      setShowModal(false);
      router.push("/login");
    }else{
      void startCheckout();
    }
  };

  return (
    <>
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

      <div className="m-4 flex flex-col items-center">
        <button
          type="button"
          onClick={handlePurchaseClick}
          className="cursor-pointer text-left shadow-2xl duration-300 hover:translate-y-1 hover:shadow-none"
        >
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
            <p className="mt-2 text-lg text-slate-600">購入すると全文を読めます</p>
            <p className="mt-2 text-md text-slate-700">
              {book.price.toLocaleString("ja-JP")}円
            </p>
          </div>
        </button>
        {error && <p className="mt-2 max-w-sm text-sm text-red-600">{error}</p>}
        {showModal && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900 bg-opacity-50 modal">
            <div className="rounded-lg bg-white p-8">
              <h3 className="mb-4 text-xl">本を購入しますか？</h3>
              <button
                type="button"
                onClick={handlePurchaseConfirm}
                disabled={isSubmitting || status === "loading"}
                className="mr-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "移動中..." : "購入する"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700 disabled:opacity-50"
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
