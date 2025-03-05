import Link from "next/link";

function NotFoundPage() {
  return (
    <div className="flex flex-col gap-2">
      404 Not Found <br></br>
      <Link to="/">Home</Link>
    </div>
  );
}

export default NotFoundPage;
