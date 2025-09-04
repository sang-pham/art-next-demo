import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1>Welcome to art-next-demo</h1>
      <p>This is the Home page.</p>
      <p>
        Visit the <Link href="/about">About page</Link>.
      </p>
    </>
  );
}
