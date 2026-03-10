import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Hapus data enrollment berdasarkan id
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("enrollment_id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Enrollment deleted" }, { status: 200 });
}
