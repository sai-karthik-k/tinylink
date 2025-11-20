// app/page.tsx
"use client";

import { useEffect, useState } from "react";

type Link = {
  id: string;
  code: string;
  url: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";

  async function fetchLinks() {
    setLoading(true);
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formUrl) {
      setFormError("URL is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formUrl,
          code: formCode || undefined,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setFormError(data.error || "Code already exists");
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to create link");
      } else {
        setFormUrl("");
        setFormCode("");
        setFormSuccess("Short link created!");
        await fetchLinks();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link ${code}?`)) return;
    await fetch(`/api/links/${code}`, { method: "DELETE" });
    await fetchLinks();
  }

  const filteredLinks = links.filter(
    (l) =>
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">TinyLink Dashboard</h1>
          <span className="text-xs text-slate-400">/healthz • /api/links • /code/:code</span>
        </header>

        {/* Create form */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="font-medium">Create short link</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">
                Target URL <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
                placeholder="https://example.com/docs"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-300">
                Custom code (optional, [A-Za-z0-9] 6–8)
              </label>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-400">{baseUrl}/</span>
                <input
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="mydocs1"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
            </div>

            {formError && <p className="text-sm text-red-400">{formError}</p>}
            {formSuccess && <p className="text-sm text-emerald-400">{formSuccess}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>
        </section>

        {/* Search + table */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <h2 className="font-medium">All links</h2>
            <input
              className="w-full sm:w-64 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="Search by code or URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : filteredLinks.length === 0 ? (
            <p className="text-sm text-slate-400">
              No links yet. Create your first short URL above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 pr-3">Code</th>
                    <th className="text-left py-2 pr-3">Target URL</th>
                    <th className="text-right py-2 pr-3">Clicks</th>
                    <th className="text-left py-2 pr-3">Last clicked</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-slate-800/60"
                    >
                      <td className="py-2 pr-3 font-mono text-xs">
                        <a
                          href={`/code/${link.code}`}
                          className="text-sky-400 hover:underline"
                        >
                          {link.code}
                        </a>
                      </td>
                      <td className="py-2 pr-3 max-w-xs">
                        <span className="truncate inline-block max-w-xs align-middle">
                          {link.url}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">{link.totalClicks}</td>
                      <td className="py-2 pr-3 text-xs text-slate-400">
                        {link.lastClickedAt
                          ? new Date(link.lastClickedAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(`${baseUrl}/${link.code}`)
                          }
                          className="text-xs rounded bg-slate-800 px-2 py-1"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="text-xs rounded bg-red-600 px-2 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}