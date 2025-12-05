// developer: Zacharie Verdieu
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/db";
import type { Transaction } from "@/types/Transaction";

// API route handler for PUT requests (update a single transaction)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, 
) {
  try {
    const { id } = await params;

    // validate id
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction id" },
        { status: 400 },
      );
    }

    // read json body
    const body = await request.json();
    const { type, amount, category, note } = body;

    // validate fields if they are provided
    if (type !== undefined && type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "type needs to be 'income' or 'expense'" },
        { status: 400 },
      );
    }

    if (
      amount !== undefined &&
      (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0)
    ) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    if (
      category !== undefined &&
      (typeof category !== "string" || !category)
    ) {
      return NextResponse.json(
        { error: "category, if provided, must be a non-empty string" },
        { status: 400 },
      );
    }

    // build update object with only provided fields
    const updates: Partial<Transaction> = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (note !== undefined) updates.note = note;

    // nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }

    // connecting to db and updating
    const collection = await getCollection(TRANSACTIONS_COLLECTION);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates },
    );

    // no document matched this id
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // success message
    return NextResponse.json(
      { message: "Transaction updated successfully" },
      { status: 200 },
    );

  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { error: "Failed to PUT (update) transaction" },
      { status: 500 },
    );
  }
}

// API route handler for DELETE requests (delete a single transaction)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // validate id
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction id" },
        { status: 400 },
      );
    }

    // connecting to db and deleting
    const collection = await getCollection(TRANSACTIONS_COLLECTION);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    // no document matched this id
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // success message
    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 },
    );

  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to DELETE transaction" },
      { status: 500 },
    );
  }
}