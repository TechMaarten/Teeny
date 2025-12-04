// developer: Maarten Lopes
// TransactionForm component – allows users to create a new income or expense
"use client";

import { useState } from "react";
import styled from "styled-components";

// Styled components
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  max-width: 480px;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.7); /* subtle transparency */
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  font-weight: 600;
  color: #1e293b;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: border 0.2s ease-in-out;

  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: border 0.2s ease-in-out;

  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const ErrorMsg = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
`;

const SuccessMsg = styled.p`
  color: #16a34a;
  font-size: 0.875rem;
`;

export default function TransactionForm() {
  // form state
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  // feedback state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handles the POST request when the form is submitted
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // client-side validation
    if (!amount || !category) {
      setError("Amount and Category are required.");
      return;
    }

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

      // clear form on success
      setAmount("");
      setCategory("");
      setNote("");
      setType("income");
      setSuccess(true);
    } catch (err: any) {
      console.error("POST error:", err);
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h2>Create Transaction</h2>

      <Label>
        Type
        <Select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
      </Label>

      <Label>
        Amount
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </Label>

      <Label>
        Category
        <Input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </Label>

      <Label>
        Note (optional)
        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Label>

      <Button type="submit">Add Transaction</Button>

      {error && <ErrorMsg>Error: {error}</ErrorMsg>}
      {success && <SuccessMsg>Transaction added!</SuccessMsg>}
    </FormContainer>
  );
}
