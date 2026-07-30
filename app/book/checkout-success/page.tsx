import Link from "next/link";

const PurchaseSuccess = () => {
  return (
    <div className="flex items-center justify-center bg-gray-100 mt-20">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          購入ありがとうございます！
        </h1>
        <p className="text-center text-gray-600">
          決済を受け付けました。購入権限はStripe webhookの確認後に反映されます。
        </p>
        <div className="mt-6 text-center">
          <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
            購入済みの記事を確認する
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
