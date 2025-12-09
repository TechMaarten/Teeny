//developer: Maarten Lopes and Nathan Moges
//TransactionListView component – displays all transactions in read-only mode
"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import UpdateTransactionForm from "./UpdateTransactionForm"; // <-- IMPORT THE FORM

// --- Transaction Data Type ---
type Transaction = {
    // Keeping 'id' here to match the type defined in your original code
    id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    note?: string;
    date: string;
};

// --- Styled components ---
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
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
        transform: translateY(-3px);
    }
`;

// Nathan: takes up the available 
//space of every transaction detail when using flex-grow
const TransactionDetails = styled.div`
    flex-grow: 1;
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

// Nathan 
const EditButton = styled.button`
    background-color: #3b82f6; 
    color: white;
    padding: 8px 15px;
    border-radius: 8px;
    font-weight: 600;
    margin-right: 8px; 

`;

// Nathan
const DeleteButton = styled.button`
    background-color: #ef4444; /* Red color */
    color: white;
    padding: 8px 15px;
    border-radius: 8px;
    font-weight: 600;

`;


export default function TransactionListView() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    // Nathan for update
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null); //Tracks if a transaction is being edited

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

    // Nathan for delete
    async function handleDeleteTransaction(id: string) {

        //Gives a warning to the user before deleting just to confirm
        if (!window.confirm("Are you sure you want to delete this transaction?")) {
            return;
        }
        //Calls our DELETE method to delete the transaction with the ID we give it
        try {
            setError(null);
            const res = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            //Error checking
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error("Failed to delete transaction");
            }
            //Removes the deleted transaction and uses filter to create a new array without the ID we just deleted
            setTransactions((prevTransactions) =>
                prevTransactions.filter((t) => t.id !== id)
            );
        //After getting that array we call fetchTransactions to resync with the server to show that the transaction is deleted
        } catch (err: any) {
            console.error(err);
            setError("Deletion failed due to unknown error.");
            fetchTransactions();
        }
    }

    return (
        <ListWrapper>
            <h2>All Transactions</h2>

            {error && <ErrorMsg>Error: {error}</ErrorMsg>}

            {/* Nathan for update and delete */}
            {editingTransaction && (
                <UpdateTransactionForm
                    // Passes the ID value of whats going to be edited
                    transactionId={editingTransaction.id}
                    // use onSuccess to refresh the list
                    onSuccess={() => {
                        setEditingTransaction(null); // Close the form
                        fetchTransactions(); // Refresh the list
                    }}
                    // Call onCancel if we want to close the form
                    onCancel={() => setEditingTransaction(null)}
                />
            )}

            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                transactions.map((t) => (
                    <Card key={t.id} $type={t.type}>
                        <TransactionDetails>
                            <Title>
                                {t.type.toUpperCase()} – ${t.amount}
                            </Title>
                            <p>Category: {t.category}</p>
                            {t.note && <Note>Note: {t.note}</Note>}
                            <DateText>{new Date(t.date).toLocaleString()}</DateText>
                        </TransactionDetails>

                        {/* Edit and Delete Buttons */}
                        <div>
                            {/* Set the transaction to be edited */}
                            <EditButton onClick={() => setEditingTransaction(t)}>
                                Edit
                            </EditButton>
                            <DeleteButton onClick={() => handleDeleteTransaction(t.id)}>
                                Delete
                            </DeleteButton>
                        </div>
                    </Card>
                ))
            )}
        </ListWrapper>
    );
}
