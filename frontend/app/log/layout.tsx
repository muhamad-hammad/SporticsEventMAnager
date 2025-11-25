import LogNavbar from '@/components/LogNavbar';

export default function LogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <LogNavbar />
            {children}
        </>
    );
}
