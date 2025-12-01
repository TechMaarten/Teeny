// developer: Victoria Mulugeta

import { NextResponse } from "next/server";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/db";
import type { Transaction } from "@/types/Transaction";

// defines the API route handler for GET requests
export async function GET() {
  try {
    // connecting to db
    const collection = await getCollection(TRANSACTIONS_COLLECTION);
    // getting all documents in descending date order
    const transactions = await collection.find({}).sort({ date: -1 }).toArray();
    // convert to json and send
    return NextResponse.json(transactions, { status: 200 });

    // catching errors
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { error: "Failed to GET transactions" },
      { status: 500 },
    );
  }
}

// defines the API route handler for POST requests
export async function POST(request: Request) {
  try {
    // read json
    const tran = await request.json();
    // deconstruct and reassign
    const { type,
      amount,
      category,
      note } = tran;

    // user did not input income or expense
    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "type needs to be 'income' or 'expense'" },
        { status: 400 },
      );
    }

    // amount is not valid
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    // category is not valid string
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 },
      );
    }

    // create new transaction object
    const transaction: Transaction = {
      type,
      amount,
      category,
      date: new Date(),
      note,
    };

    // get current documents and add new one
    const collection = await getCollection(TRANSACTIONS_COLLECTION);
    const result = await collection.insertOne(transaction);

    return NextResponse.json(
      { ...transaction, _id: result.insertedId },
      { status: 201 },
    );

  // error handling
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Failed to POST transaction" },
      { status: 500 },
    );
  }
}