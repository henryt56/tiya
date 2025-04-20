import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col gap-2">
      404 Not Found <br></br>
      <Link href="/">Home</Link>
    </div>
  );
}
