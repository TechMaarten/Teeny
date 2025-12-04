// add comments
// developer : Victoria Mulugeta
export type Transaction = {
    type: "income" | "expense";
    amount: number,
    category: string,

    // might need to change to some date data type
    date: Date,

    note?: string,
}