'use client';

import AdminRoute from "@/components/AdminRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoute>
            <AdminNavbar />
            {children}
        </AdminRoute>
    );
}
