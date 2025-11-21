'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push("/dashboard"); // redirect non-admin users
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role !== "admin") return <p>Loading...</p>;

  return <>{children}</>;
}
