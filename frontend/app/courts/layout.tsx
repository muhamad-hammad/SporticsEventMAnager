import CourtsNavbar from '@/components/CourtsNavbar';

export default function CourtsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <CourtsNavbar />
            {children}
        </>
    );
}
