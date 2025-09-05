import Layout from "../../components/layout/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <section className="section">
        <div className="card">
          <h1>About</h1>
          <p className="muted">
            This is a minimal Next.js 15 project scaffold following the rules in AI_RULES.md.
          </p>
        </div>
      </section>
    </Layout>
  );
}
