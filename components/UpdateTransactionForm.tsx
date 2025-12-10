// Developer: Nathan Moges
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";

//Defines the info that will be used in our form
type TransactionFormDataType = {
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  date: string;
};


interface UpdateFormProps {
  transactionId: string;
  onSuccess: () => void; //Used for when there is a successfulm update on a transaction
  onCancel: () => void; //Used for if the user canceld editing which will close the form without saving
}

// styled-components 
const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 550px;
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
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: black;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: black;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

/*Conditional coloring depending on if primary is true or false */
const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 20px;

  border: none;
  border-radius: 8px; 
  cursor: pointer;
  font-weight: 700;
  color: white;
  background-color: ${(props) => (props.$primary ? "#22c55e" : "#6b7280")}; 
`;

const ErrorMsg = styled.p`
  color: #dc2626;
  text-align: center;
`;

//Converts any date that is given in YYYY-MM-DD form so it can be ised in HTML date format
const formatDateForInput = (dateString: string | Date): string => {
  return new Date(dateString).toISOString().split("T")[0];
};

//This function takes in the transaction ID and two functions that are defined later
function UpdateTransactionForm({ transactionId, onSuccess, onCancel }: UpdateFormProps) {
  const [formData, setFormData] = useState<TransactionFormDataType | null>(null); //Live state that shows the edits of the user
  const [initialData, setInitialData] = useState<TransactionFormDataType | null>(null); //Original copy of the data in order to compare the changes the user inputs
  const [loading, setLoading] = useState(true); //Tracks our app for when it is fetching the data that we are updating
  const [error, setError] = useState<string | null>(null); // Error catching variable for useEffect


  //Side effect for when the ID changes
  useEffect(() => {
    async function fetchTransaction() {
    
      setLoading(true);
      setError(null);
      //Error catching
      try {
        //Fetches from the database
        const res = await fetch(`/api/transactions/${transactionId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error("Failed to fetch transaction details.");
        }
        const transaction = await res.json();
        //Takes the raw data and presents in the clean date format for our form. Function for   
        const dataToSet: TransactionFormDataType = {
          ...transaction,
          date: formatDateForInput(transaction.date),
          note: transaction.note || "",
        };

        //Stores the object that we just formatted to display to the user
        setFormData(dataToSet);
        setInitialData(dataToSet);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not load transaction data.");
      } finally {
        //Setloading is put to false to show the form or present an error message
        setLoading(false);
      }
    }
    fetchTransaction();
  }, [transactionId]);

  //This function is used when a user tries to update and changes the value. 
  //When a user changes a value in the transaction it will be savved in the formData state with the new valuer
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: name === "amount" ? parseFloat(value) || 0 : value, //converts the value from a string to a number
    }));
  };

//This function is to handle when a user save changes to the updateform
//When there are no changes the user will get an error when there are  no changes
//When there are changes it will send PUT request with the updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData || !initialData) return;

    const updates: Partial<TransactionFormDataType> = {};

    //Checks individual fields to see if there is a change and updates
    if (formData.type !== initialData.type) updates.type = formData.type;
    if (Math.abs(formData.amount - initialData.amount) > 0.001) updates.amount = formData.amount;
    if (formData.category !== initialData.category) updates.category = formData.category;
    if (formData.note !== initialData.note) updates.note = formData.note;
    if (formData.date !== initialData.date) updates.date = formData.date;

    if (Object.keys(updates).length === 0) {
      setError("No changes detected.");
      return;
    }

    //Sends put request to the backend 
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update transaction");
      }
      onSuccess();
      //Error catching
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error during update.");
    }
  };

//This is what will be displayed while the data gets fetched
  if (loading)
    return (
      <FormOverlay>
        <FormContainer>
          <p>Loading transaction details...</p>
        </FormContainer>
      </FormOverlay>
    );

//Returns null when there is no form data available
  if (!formData) return null;


  return (
    <FormOverlay>
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              >
        {/*Creates drop down to identify if its an income or an expense*/}
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </InputGroup>

          {/* Amount field to enter*/}
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

          {/* Category field to enter*/}
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

         {/* Date field to enter*/}
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

          {/* Optional note field to enter */}
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

        {/* Cancel button */}
          <ButtonGroup>
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
        {/* Save changes button which will save only if there was an update */}
            <Button type="submit" $primary>
              Save Changes
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </FormOverlay>
  );
}

export default UpdateTransactionForm;
