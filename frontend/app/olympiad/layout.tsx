import OlympiadNavbar from '@/components/OlympiadNavbar';

export default function OlympiadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <OlympiadNavbar />
            {children}
        </>
    );
}
