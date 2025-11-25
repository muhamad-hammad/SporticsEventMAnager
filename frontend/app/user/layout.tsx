'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import UserNavbar from "@/components/UserNavbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <UserNavbar />
            {children}
        </ProtectedRoute>
    );
}
