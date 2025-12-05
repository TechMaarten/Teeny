// UpdateTransactionForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";

// --- Types ---
// Define the shape of the data needed for the form
type TransactionFormDataType = {
    type: "income" | "expense";
    amount: number;
    category: string;
    note: string;
    date: string;
};

// Interface for props received by the component
interface UpdateFormProps {
    transactionId: string;
    onSuccess: () => void; // Callback to refresh the list and close the form
    onCancel: () => void; // Callback to close the form
}

// --- Styled Components (Minimal styling for a clean overlay) ---

const FormOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6); /* Darker overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const FormContainer = styled.div`
    background: #ffffff;
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 550px;
    z-index: 1001;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 6px;
    font-weight: 700;
    color: #333;
    font-size: 0.95rem;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: black;
    &:focus {
        border-color: #3b82f6;
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: black;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const Button = styled.button<{ $primary?: boolean }>`
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    color: white;
    background-color: ${(props) => (props.$primary ? "#22c55e" : "#6b7280")};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${(props) => (props.$primary ? "#16a34a" : "#4b5563")};
    }
`;

const ErrorMsg = styled.p`
    color: #dc2626;
    text-align: center;
    font-weight: 500;
`;

// Helper to format date string to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (dateString: string | Date): string => {
    return new Date(dateString).toISOString().split('T')[0];
};

const UpdateTransactionForm: React.FC<UpdateFormProps> = ({ transactionId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<TransactionFormDataType | null>(null);
    const [initialData, setInitialData] = useState<TransactionFormDataType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. FETCH existing data for pre-filling
    useEffect(() => {
        async function fetchTransaction() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/transactions/${transactionId}`);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to fetch transaction details.");
                }
                const transaction = await res.json();

                // Ensure date is formatted correctly
                const dataToSet: TransactionFormDataType = {
                    ...transaction,
                    date: formatDateForInput(transaction.date),
                    note: transaction.note || '', // Ensure note is a string
                };

                setFormData(dataToSet);
                setInitialData(dataToSet); // Keep a copy of the original data
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Could not load transaction data.");
            } finally {
                setLoading(false);
            }
        }
        fetchTransaction();
    }, [transactionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev!,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    // 2. HANDLE PUT REQUEST to update the transaction
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData || !initialData) return;

        // Build the update object with ONLY the fields that have changed
        const updates: Partial<TransactionFormDataType> = {};

        if (formData.type !== initialData.type) updates.type = formData.type;
        // Use a small tolerance check for floating-point numbers
        if (Math.abs(formData.amount - initialData.amount) > 0.001) updates.amount = formData.amount;
        if (formData.category !== initialData.category) updates.category = formData.category;
        if (formData.note !== initialData.note) updates.note = formData.note;
        if (formData.date !== initialData.date) updates.date = formData.date;


        if (Object.keys(updates).length === 0) {
            setError("No changes detected.");
            return;
        }

        try {
            const res = await fetch(`/api/transactions/${transactionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates), // Send ONLY the changed data
            });

            const data = await res.json();

            if (!res.ok) {
                // If the error comes from backend validation (e.g., amount is invalid)
                throw new Error(data.error || "Failed to update transaction");
            }

            // Call success callback (will refresh list and close form)
            onSuccess();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Unknown error during update.");
        }
    };

    if (loading) return (
        <FormOverlay>
            <FormContainer>
                <p>Loading transaction details...</p>
            </FormContainer>
        </FormOverlay>
    );

    // Safety check: if data isn't loaded, don't render the form
    if (!formData) return null;


    return (
        <FormOverlay>
            <FormContainer>
                <h3>Edit Transaction (ID: {transactionId.substring(0, 8)}...)</h3>
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <Form onSubmit={handleSubmit}>

                    {/* Type Select */}
                    <InputGroup>
                        <Label htmlFor="type">Type</Label>
                        <Select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </Select>
                    </InputGroup>

                    {/* Amount Input */}
                    <InputGroup>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>

                    {/* Category Input */}
                    <InputGroup>
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            type="text"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>

                    {/* Date Input */}
                    <InputGroup>
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>

                    {/* Note Input */}
                    <InputGroup>
                        <Label htmlFor="note">Note</Label>
                        <Input
                            id="note"
                            name="note"
                            type="text"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Optional note"
                        />
                    </InputGroup>

                    <ButtonGroup>
                        <Button type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" $primary>
                            Save Changes
                        </Button>
                    </ButtonGroup>
                </Form>
            </FormContainer>
        </FormOverlay>
    );
};

export default UpdateTransactionForm;
