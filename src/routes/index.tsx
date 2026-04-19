import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, Image as ImageIcon, Mic, Video, Link2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel AI — Phishing & Deepfake Detection" },
      { name: "description", content: "Detect phishing URLs, scam emails, deepfakes, and voice fraud with AI-powered analysis." },
      { property: "og:title", content: "Sentinel AI — Phishing & Deepfake Detection" },
      { property: "og:description", content: "Detect phishing URLs, scam emails, deepfakes, and voice fraud with AI-powered analysis." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Link2, title: "URL Analysis", desc: "Heuristic checks for phishing domains, shorteners, and homographs." },
  { icon: Mail, title: "Email Scanning", desc: "NLP-based keyword and link analysis for scam detection." },
  { icon: ImageIcon, title: "Image Forensics", desc: "Detect AI-generated and manipulated imagery." },
  { icon: Mic, title: "Voice Analysis", desc: "Identify synthetic voice and audio scams." },
  { icon: Video, title: "Video Deepfakes", desc: "Frame-level analysis for face-swap detection." },
  { icon: ShieldCheck, title: "Scan History", desc: "Track all your analyses securely in one place." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                AI Threat Intelligence · Live
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Defend against{" "}
              <span className="text-gradient">phishing</span> and{" "}
              <span className="text-gradient">deepfakes</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Sentinel AI analyzes URLs, emails, images, audio, and video to detect modern
              social-engineering attacks — all in one private dashboard.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                  Start scanning <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">Sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">capabilities</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Multi-modal threat detection
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card transition hover:border-primary/40 hover:shadow-glow">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground sm:px-6">
          © Sentinel AI · Built for safer communications
        </div>
      </footer>
    </div>
  );
}