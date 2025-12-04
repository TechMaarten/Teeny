//developer Maarten Lopes
import TransactionForm from "@/components/TransactionForm";

//Display Transaction form
export default function CreateTransactionPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center p-4">New Transaction</h1>
      <TransactionForm />
    </>
  );
}
