import Link from "next/link";

export default function HomePage() {
  return (
    <section className="section">
      <div className="card">
        <h1>Welcome to art-next-demo</h1>
        <p className="muted">
          A minimal Next.js 15 scaffold with a refreshed, modern UI.
        </p>
        <div className="flex gap-2.5 flex-wrap mt-2">
          <Link className="btn btn-primary" href="/about" aria-label="Learn more on the About page">
            Learn more
          </Link>
          <Link className="btn" href="/register" aria-label="Create an account">
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
