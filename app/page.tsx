import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link href="/">Home (Form for now)</Link>
        <Link href="/application">Application</Link>
        <Link href="/about">About</Link>
      </nav>

      <h1>Application Form</h1>
      <p>Form comes next.</p>
    </main>
  );
}