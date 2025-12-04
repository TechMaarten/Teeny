//developer: Maarten Lopes
//TransactionListView component – displays all transactions in read-only mode
"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

//Transaction data type
type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: string;
};

//Styled components
const ListWrapper = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.65); /* frosted glass look */
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
`;

const Card = styled.div<{ $type: "income" | "expense" }>`
  background: #f8fafc;
  border-left: 5px solid ${(props) => (props.$type === "income" ? "#22c55e" : "#ef4444")};
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Title = styled.h3`
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
`;

const Note = styled.p`
  font-style: italic;
  color: #475569;
  margin: 0.25rem 0;
`;

const DateText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const ErrorMsg = styled.p`
  color: #dc2626;
  text-align: center;
  font-weight: 500;
  font-size: 1rem;
`;


export default function TransactionListView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  //Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  //GET /api/transactions – fetch from backend
  async function fetchTransactions() {
    try {
      setError(null);
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch transactions");
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <ListWrapper>
      <h2>All Transactions</h2>

      {error && <ErrorMsg>Error: {error}</ErrorMsg>}

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        transactions.map((t) => (
          <Card key={t._id} $type={t.type}>
            <Title>
              {t.type.toUpperCase()} – ${t.amount}
            </Title>
            <p>Category: {t.category}</p>
            {t.note && <Note>Note: {t.note}</Note>}
            <DateText>{new Date(t.date).toLocaleString()}</DateText>

            {/* Nate: add buttons below this line */}
            {/* <Button onClick={() => onEdit(t._id)}>Edit</Button> */}
            {/* <Button onClick={() => onDelete(t._id)}>Delete</Button> */}
          </Card>
        ))
      )}
    </ListWrapper>
  );
}
