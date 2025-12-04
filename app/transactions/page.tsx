//developer Maarten Lopes
import TransactionListView from "@/components/TransactionListView";

//Display Transactions
export default function TransactionsPage() {
  return (
    <>
      <h1 className="text-2xl text-center p-4 font-bold">All Transactions</h1>
      <TransactionListView />
    </>
  );
}
