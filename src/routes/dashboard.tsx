import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Link2, Mail, Upload, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { analyzeUrl, analyzeEmail, analyzeMedia, type AnalysisResult } from "@/lib/analyze";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sentinel AI" },
      { name: "description", content: "Run threat analysis on URLs, emails, and media." },
    ],
  }),
  component: Dashboard,
});

type Tab = "url" | "email" | "media";

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [emailText, setEmailText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  const persist = async (
    scan_type: "url" | "email" | "image" | "audio" | "video",
    input_summary: string,
    res: AnalysisResult,
  ) => {
    if (!user) return;
    const { error } = await supabase.from("scans").insert({
      user_id: user.id,
      scan_type,
      input_summary: input_summary.slice(0, 200),
      risk_score: res.risk_score,
      attack_type: res.attack_type,
      confidence: res.confidence,
      details: { signals: res.signals },
    });
    if (error) console.error("Persist failed", error);
  };

  const mediaKind = (f: File): "image" | "audio" | "video" => {
    if (f.type.startsWith("image/")) return "image";
    if (f.type.startsWith("audio/")) return "audio";
    return "video";
  };

  const handleAnalyze = async () => {
    setResult(null);
    setAnalyzing(true);
    // Small artificial delay so loading state is visible
    await new Promise((r) => setTimeout(r, 700));
    try {
      if (tab === "url") {
        if (!url.trim()) return toast.error("Enter a URL to analyze");
        const r = analyzeUrl(url);
        setResult(r);
        await persist("url", url, r);
      } else if (tab === "email") {
        if (emailText.trim().length < 10) return toast.error("Paste at least 10 characters of email content");
        const r = analyzeEmail(emailText);
        setResult(r);
        await persist("email", emailText.slice(0, 80), r);
      } else {
        if (!file) return toast.error("Upload a file to analyze");
        const kind = mediaKind(file);
        const r = analyzeMedia(file, kind);
        setResult(r);
        await persist(kind, file.name, r);
      }
    } finally {
      setAnalyzing(false);
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
      <div className="absolute inset-x-0 top-16 -z-0 h-[400px] bg-gradient-hero opacity-60" />
      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">analyzer</div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Run a scan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an input type, paste or upload, then run analysis.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setResult(null); }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url"><Link2 className="mr-1.5 h-4 w-4" /> URL</TabsTrigger>
              <TabsTrigger value="email"><Mail className="mr-1.5 h-4 w-4" /> Email</TabsTrigger>
              <TabsTrigger value="media"><Upload className="mr-1.5 h-4 w-4" /> Media</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-5">
              <Input
                placeholder="https://suspicious-link.example.com"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
            </TabsContent>

            <TabsContent value="email" className="mt-5">
              <Textarea
                placeholder="Paste the suspicious email content here…"
                value={emailText} onChange={(e) => setEmailText(e.target.value)}
                rows={8} className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="media" className="mt-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-background/40 px-6 py-10 text-center transition hover:border-primary/50 hover:bg-background/60">
                <Upload className="mb-2 h-7 w-7 text-muted-foreground" />
                <div className="font-medium">
                  {file ? file.name : "Click to upload image, audio, or video"}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(1)} KB · ${file.type || "unknown"}` : "any media file"}
                </div>
                <input
                  type="file" className="hidden"
                  accept="image/*,audio/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleAnalyze} disabled={analyzing}
            className="mt-6 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            size="lg"
          >
            {analyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Analyze</>
            )}
          </Button>
        </div>

        <div className="mt-6">
          {analyzing && !result && (
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-10 text-center shadow-card">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <div className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                running heuristic models…
              </div>
            </div>
          )}
          {result && <ResultCard result={result} />}
        </div>

        <div className="mt-8 text-center">
          <Link to="/history" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            → view scan history
          </Link>
        </div>
      </main>
    </div>
  );
}