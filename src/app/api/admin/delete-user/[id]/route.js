import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req, { params }) {
  const { id } = await params;  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "No service role key" }, { status: 500 });
  }

  // Hapus user dari Auth
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      apiKey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  // Hapus user dari tabel users
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  await supabase.from("users").delete().eq("user_id", id);

  return NextResponse.json({ success: true });
}
