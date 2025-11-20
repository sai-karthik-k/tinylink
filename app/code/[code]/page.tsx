// app/code/[code]/page.tsx
import { prisma } from "@/lib/db";

interface Props {
  params: { code: string };
}

export default async function CodeStatsPage({ params }: Props) {
  const link = await prisma.link.findUnique({
    where: { code: params.code },
  });

  if (!link) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Not found</h1>
          <p className="text-sm text-slate-400">No link for code “{params.code}”.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        <a
          href="/"
          className="text-sm text-sky-400 hover:underline"
        >
          ← Back to dashboard
        </a>

        <h1 className="text-2xl font-semibold">Stats: {link.code}</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-sm">
          <div>
            <div className="text-slate-400">Short URL</div>
            <div className="font-mono text-xs">
              {process.env.NEXT_PUBLIC_BASE_URL}/{link.code}
            </div>
          </div>

          <div>
            <div className="text-slate-400">Target URL</div>
            <div className="break-words">{link.url}</div>
          </div>

          <div className="flex gap-6">
            <div>
              <div className="text-slate-400">Total clicks</div>
              <div className="text-lg font-semibold">{link.totalClicks}</div>
            </div>
            <div>
              <div className="text-slate-400">Last clicked</div>
              <div>
                {link.lastClickedAt
                  ? new Date(link.lastClickedAt).toLocaleString()
                  : "Never"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400">Created at</div>
            <div>{new Date(link.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </main>
  );
}