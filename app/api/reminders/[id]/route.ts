import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function DELETE(
  request: NextRequest,
  props: Props
) {
  const { id } = props.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("reemind");

    const result = await db.collection("reminders").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("🔥 Error deleting reminder:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: Props
) {
  const { id } = props.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { _id, ...updateFields } = body;

  try {
    const client = await clientPromise;
    const db = client.db("reemind");

    const result = await db.collection("reminders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({
      success: result.modifiedCount > 0,
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("🔥 Error updating reminder:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
} 