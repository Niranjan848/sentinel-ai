import { AlertTriangle, ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyze";
import { Card } from "@/components/ui/card";

function colorFor(score: number) {
  if (score >= 70) return { ring: "stroke-destructive", text: "text-destructive", bg: "bg-destructive/10" };
  if (score >= 40) return { ring: "stroke-warning", text: "text-warning", bg: "bg-warning/10" };
  return { ring: "stroke-success", text: "text-success", bg: "bg-success/10" };
}

export function ResultCard({ result }: { result: AnalysisResult }) {
  const c = colorFor(result.risk_score);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (result.risk_score / 100) * circumference;

  const Icon =
    result.attack_type === "Safe" ? ShieldCheck :
    result.attack_type === "Suspicious" ? Activity :
    result.risk_score >= 70 ? ShieldAlert : AlertTriangle;

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-card p-6 shadow-card animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {/* Score ring */}
        <div className="relative mx-auto h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r={r} className="fill-none stroke-muted" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r}
              className={`fill-none ${c.ring} transition-all duration-1000`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-display text-3xl font-bold ${c.text}`}>{result.risk_score}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">risk</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
              <Icon className={`h-5 w-5 ${c.text}`} />
            </span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                attack classification
              </div>
              <div className="font-display text-xl font-semibold">{result.attack_type}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-border bg-background/50 px-2.5 py-1 font-mono uppercase tracking-wider text-muted-foreground">
              Confidence: <span className="text-foreground">{result.confidence}</span>
            </span>
          </div>

          {result.signals.length > 0 && (
            <div>
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                detected signals
              </div>
              <ul className="space-y-1 text-sm">
                {result.signals.map((s, i) => (
                  <li key={i} className="flex gap-2 text-muted-foreground">
                    <span className="text-primary">›</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}