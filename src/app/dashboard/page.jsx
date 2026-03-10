"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PengajarDashboard from "./pengajar/page";
import SiswaDashboardPage from "./siswa/page";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = await createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (error || !userData) {
        await supabase.auth.signOut();
        router.push("/");
        return;
      }
      setUserRole(userData.role);
      setLoading(false);
    };
    fetchRole();
  }, [router]);

  if (loading) {
    return <div>Memuat dashboard...</div>;
  }

  if (userRole === "pengajar") {
    return <PengajarDashboard />;
  }

  // Default: siswa
  return <SiswaDashboardPage />;
}
