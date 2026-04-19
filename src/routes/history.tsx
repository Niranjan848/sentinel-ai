import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, Link2, Mail, Image as ImageIcon, Mic, Video } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Sentinel AI" },
      { name: "description", content: "Review your past Sentinel AI threat scans." },
    ],
  }),
  component: History,
});

type Scan = {
  id: string;
  scan_type: "url" | "email" | "image" | "audio" | "video";
  input_summary: string;
  risk_score: number;
  attack_type: string;
  confidence: string;
  created_at: string;
};

const ICONS = {
  url: Link2, email: Mail, image: ImageIcon, audio: Mic, video: Video,
} as const;

function badgeColor(score: number) {
  if (score >= 70) return "bg-destructive/15 text-destructive border-destructive/30";
  if (score >= 40) return "bg-warning/15 text-warning border-warning/30";
  return "bg-success/15 text-success border-success/30";
}

function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("scans")
        .select("id, scan_type, input_summary, risk_score, attack_type, confidence, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) toast.error("Failed to load history");
      else setScans((data ?? []) as Scan[]);
      setLoading(false);
    })();
  }, [user]);

  const remove = async (id: string) => {
    const prev = scans;
    setScans(scans.filter((s) => s.id !== id));
    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) {
      setScans(prev);
      toast.error("Failed to delete");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">log</div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Scan history</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your last {scans.length} scans</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">+ New scan</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : scans.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-12 text-center shadow-card">
            <p className="text-muted-foreground">No scans yet. Run your first analysis.</p>
            <Link to="/dashboard" className="mt-4 inline-block">
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Go to dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {scans.map((s) => {
              const Icon = ICONS[s.scan_type];
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-gradient-card p-4 shadow-card transition hover:border-primary/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold">{s.attack_type}</span>
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badgeColor(s.risk_score)}`}>
                        {s.risk_score}% risk
                      </span>
                      <span className="rounded-md border border-border bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.scan_type}
                      </span>
                    </div>
                    <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {s.input_summary}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="mt-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}