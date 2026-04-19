// Detection logic — heuristic-based for URLs and emails,
// placeholder logic for media. Returns standard result shape.

export type AnalysisResult = {
  risk_score: number;
  attack_type: "Phishing" | "Deepfake" | "Voice Scam" | "Safe" | "Suspicious";
  confidence: "Low" | "Medium" | "High";
  signals: string[];
};

const PHISHING_KEYWORDS = [
  "verify", "suspend", "urgent", "password", "click here", "confirm your",
  "account locked", "win", "prize", "free", "bitcoin", "wire transfer",
  "gift card", "ssn", "tax refund", "irs", "limited time", "act now",
];

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".loan"];
const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly"];

function confidenceFor(score: number): AnalysisResult["confidence"] {
  if (score >= 70 || score <= 15) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function analyzeUrl(rawUrl: string): AnalysisResult {
  const signals: string[] = [];
  let score = 5;
  const url = rawUrl.trim().toLowerCase();

  let host = url;
  try {
    host = new URL(url.startsWith("http") ? url : `http://${url}`).hostname;
  } catch {
    signals.push("Malformed URL");
    score += 25;
  }

  if (!url.startsWith("https://")) { score += 15; signals.push("No HTTPS"); }
  if (host.split(".").length > 3) { score += 15; signals.push("Excessive subdomains"); }
  if (/\d{4,}/.test(host)) { score += 10; signals.push("Long digit sequence in host"); }
  if (host.includes("-")) { score += 5; signals.push("Hyphen in domain"); }
  if (SUSPICIOUS_TLDS.some(tld => host.endsWith(tld))) { score += 25; signals.push("Suspicious TLD"); }
  if (URL_SHORTENERS.some(s => host.includes(s))) { score += 20; signals.push("URL shortener"); }
  if (/login|verify|secure|account|update|wallet/.test(host)) { score += 15; signals.push("Sensitive keyword in host"); }
  if (/[а-яёÀ-ÿ]/.test(host)) { score += 30; signals.push("Non-ASCII characters (homograph attack)"); }
  if (host.length > 40) { score += 10; signals.push("Unusually long hostname"); }

  score = Math.min(100, Math.max(0, score));
  const attack_type = score >= 60 ? "Phishing" : score >= 35 ? "Suspicious" : "Safe";
  return { risk_score: score, attack_type, confidence: confidenceFor(score), signals };
}

export function analyzeEmail(text: string): AnalysisResult {
  const signals: string[] = [];
  let score = 5;
  const lower = text.toLowerCase();

  const matched = PHISHING_KEYWORDS.filter(k => lower.includes(k));
  score += matched.length * 8;
  if (matched.length) signals.push(`Suspicious keywords: ${matched.slice(0, 4).join(", ")}`);

  const links = lower.match(/https?:\/\/[^\s)]+/g) || [];
  if (links.length > 3) { score += 10; signals.push(`${links.length} links present`); }
  if (links.some(l => URL_SHORTENERS.some(s => l.includes(s)))) {
    score += 15;
    signals.push("Contains URL shortener");
  }

  if (/!{2,}/.test(text)) { score += 5; signals.push("Excessive punctuation"); }
  if (/\b(dear (customer|user|client))\b/i.test(text)) { score += 10; signals.push("Generic greeting"); }
  if (/\$\d+|\d+ ?(usd|eur|btc)/i.test(text)) { score += 8; signals.push("Money amount mentioned"); }
  if (text.length < 80 && links.length > 0) { score += 10; signals.push("Short message with links"); }

  score = Math.min(100, Math.max(0, score));
  const attack_type = score >= 60 ? "Phishing" : score >= 35 ? "Suspicious" : "Safe";
  return { risk_score: score, attack_type, confidence: confidenceFor(score), signals };
}

// Placeholder media analyzers — derive a stable pseudo-score from file metadata
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function analyzeMedia(file: File, kind: "image" | "audio" | "video"): AnalysisResult {
  const signals: string[] = [];
  const seed = hashString(`${file.name}-${file.size}-${kind}`);
  let score = (seed % 70) + 10; // 10..80 deterministic

  if (file.size < 10_000) { score += 10; signals.push("Very small file size"); }
  if (file.size > 25_000_000) { score += 5; signals.push("Large file size"); }
  signals.push(`Analyzed ${kind} (${(file.size / 1024).toFixed(1)} KB)`);
  signals.push("Heuristic placeholder model — production would use a CNN / spectral analysis pipeline");

  score = Math.min(95, Math.max(5, score));
  const attack_type =
    kind === "audio"
      ? score >= 55 ? "Voice Scam" : "Safe"
      : score >= 55 ? "Deepfake" : "Safe";

  return { risk_score: score, attack_type, confidence: confidenceFor(score), signals };
}