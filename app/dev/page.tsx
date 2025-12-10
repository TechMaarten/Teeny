// developer: Zacharie Verdieu
// idk how we defining the split between frontend and backend, so I wrote this file that is basically a frontend to 
// test the api routes and display all the data to give y'all a starting point. I felt like fetching the data is lowkey a 
// backend job so I put this here to show how to do it. Feel free to move this code wherever you want or delete it if you don't need it.
"use client";

import { useEffect, useState } from "react";

type Transaction = {
  _id: string; 
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: string;
};

export default function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple create form
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  // simple update form
  const [updateId, setUpdateId] = useState("");
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateNote, setUpdateNote] = useState("");

  // simple delete form
  const [deleteId, setDeleteId] = useState("");

  // GET – fetch all transactions
  async function loadTransactions() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch transactions");
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadTransactions();
  }, []);

  // POST – add a new transaction
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create transaction");
      }
      await loadTransactions();
      setAmount("");
      setCategory("");
      setNote("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    }
  }

  // PUT – update an existing transaction by id
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!updateId) {
      setError("Please provide an id to update");
      return;
    }
    try {
      const body: any = {};
      if (updateAmount) body.amount = Number(updateAmount);
      if (updateNote) body.note = updateNote;

      const res = await fetch(`/api/transactions/${updateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update transaction");
      }
      await loadTransactions();
      setUpdateAmount("");
      setUpdateNote("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    }
  }

  // DELETE – delete an existing transaction by id
  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!deleteId) {
      setError("Please provide an id to delete");
      return;
    }
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete transaction");
      }
      await loadTransactions();
      setDeleteId("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "5px" }}>
      <h1>Transactions</h1>

      <button onClick={loadTransactions} disabled={loading}>
        Refresh (GET)
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
        {transactions.map((t) => (
          <li
            key={t._id}
          >
            <div><strong>ID:</strong> {t._id}</div>
            <div>
              <strong>{t.type.toUpperCase()}</strong> – ${t.amount} –{" "}
              {t.category}
            </div>
            {t.note && <div><em>Note:</em> {t.note}</div>}
            <div>
              <small>{new Date(t.date).toLocaleString()}</small>
            </div>
          </li>
        ))}
      </ul>

      <section>
        <h2>Add Transaction (POST)</h2>
        <form onSubmit={handleCreate}>
          <label>
            Type:
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "income" | "expense")
              }
            >
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </label>
          <br />
          <label>
            Amount:
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Category:
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Note:
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Create (POST)</button>
        </form>
      </section>

      {/* PUT form */}
      <section>
        <h2>Update Transaction (PUT)</h2>
        <form onSubmit={handleUpdate}>
          <label>
            Transaction ID:
            <input
              type="text"
              value={updateId}
              onChange={(e) => setUpdateId(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            New Amount (optional):
            <input
              type="number"
              step="0.01"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(e.target.value)}
            />
          </label>
          <br />
          <label>
            New Note (optional):
            <input
              type="text"
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Update (PUT)</button>
        </form>
      </section>

      {/* DELETE form */}
      <section>
        <h2>Delete Transaction (DELETE)</h2>
        <form onSubmit={handleDelete}>
          <label>
            Transaction ID:
            <input
              type="text"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              required
            />
          </label>
          <br />
          <button type="submit">Delete (DELETE)</button>
        </form>
      </section>
    </main>
  );
}
