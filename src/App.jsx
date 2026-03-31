import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { key: "dataCollection", label: "Data Collection",     icon: "◈", desc: "What personal info they gather about you" },
  { key: "dataSelling",    label: "Data Selling",        icon: "◉", desc: "Whether they profit by selling your info" },
  { key: "thirdParty",     label: "Third-Party Sharing", icon: "◎", desc: "Who else gets access to your data" },
  { key: "retention",      label: "Data Retention",      icon: "◷", desc: "How long they keep your information" },
  { key: "userRights",     label: "Your Rights",         icon: "◑", desc: "Your ability to access, edit or delete your data" },
  { key: "security",       label: "Security",            icon: "◆", desc: "How well they protect your data from breaches" },
];

const SURVEY_QUESTIONS = [
  { key: "dataCollection", label: "Collecting lots of personal data about you" },
  { key: "dataSelling",    label: "Selling your data to advertisers or brokers" },
  { key: "thirdParty",     label: "Sharing your data with unknown third parties" },
  { key: "retention",      label: "Keeping your data forever with no clear end date" },
  { key: "userRights",     label: "Not letting you delete your account or data" },
  { key: "security",       label: "Weak security — your data could get leaked" },
];

const DEFAULT_WEIGHTS = Object.fromEntries(SURVEY_QUESTIONS.map(q => [q.key, 3]));

function computeFinalScore(components) {
  const { historical, policy, recent } = components;
  return Math.round((historical * 0.4) + (policy * 0.4) + (recent * 0.2));
}

function applyWeights(categories, weights) {
  const weightToMultiplier = w => 0.25 + (w - 1) * (1.75 / 4);
  let weightedSum = 0, totalMultiplier = 0;
  for (const cat of CATEGORIES) {
    const score = categories[cat.key] ?? 50;
    const w = weights[cat.key] ?? 3;
    const m = weightToMultiplier(w);
    weightedSum += score * m;
    totalMultiplier += m;
  }
  return Math.round(weightedSum / totalMultiplier);
}

function TrafficLight({ score }) {
  const color = score >= 65 ? "green" : score >= 35 ? "amber" : "red";
  const label = score >= 65 ? "Lower Risk" : score >= 35 ? "Moderate Risk" : "High Risk";
  const hex = { green: "#00e676", amber: "#ffab00", red: "#ff1744" };
  const bg = hex[color];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 52, height: 148, background: "#0a0a0a", borderRadius: 26, border: "1px solid #1e1e1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 0", boxShadow: `0 0 40px ${bg}33` }}>
        {["red", "amber", "green"].map(c => (
          <div key={c} style={{ width: 26, height: 26, borderRadius: "50%", background: c === color ? hex[c] : "#111", boxShadow: c === color ? `0 0 20px ${hex[c]}99` : "none", border: `1px solid ${c === color ? hex[c] : "#222"}`, transition: "all 0.6s ease" }} />
        ))}
      </div>
      <div style={{ fontSize: 9, fontFamily: "'Space Mono',monospace", letterSpacing: 2, color: bg, textTransform: "uppercase", textAlign: "center" }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: "'Space Mono',monospace", color: bg, fontWeight: 700, lineHeight: 1 }}>{score}<span style={{ fontSize: 13, opacity: 0.5 }}>/100</span></div>
    </div>
  );
}

function ScoreBreakdown({ components, rawScore, weightedScore, hasWeights }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "10px 14px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: open ? "4px 4px 0 0" : 4, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, letterSpacing: 2, color: "#444", fontFamily: "'Space Mono',monospace" }}>◈ HOW THIS SCORE WAS CALCULATED</div>
        <div style={{ fontSize: 8, color: "#333", fontFamily: "'Space Mono',monospace" }}>{open ? "▲ hide" : "▼ show"}</div>
      </div>
      {open && (
        <div style={{ padding: "16px", background: "#080808", border: "1px solid #1a1a1a", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Historical Record", value: components.historical, weight: "40%", color: "#7c6fff", desc: "Track record, fines, documented scandals" },
              { label: "Policy Analysis",   value: components.policy,     weight: "40%", color: "#00e676", desc: "What their current policy actually says" },
              { label: "Recent News",       value: components.recent,     weight: "20%", color: "#00bcd4", desc: "Issues from the last 90 days" },
            ].map(c => (
              <div key={c.label} style={{ padding: "12px", background: "#0d0d0d", border: "1px solid #161616", borderRadius: 3, textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "#333", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>{c.label.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontFamily: "'Space Mono',monospace", color: c.color, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{c.value}</div>
                <div style={{ fontSize: 8, color: "#444", fontFamily: "'Space Mono',monospace", marginBottom: 6 }}>weight: {c.weight}</div>
                <div style={{ fontSize: 10, color: "#333", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#444", lineHeight: 2 }}>
            <span style={{ color: "#7c6fff" }}>{components.historical}</span>×0.4 + <span style={{ color: "#00e676" }}>{components.policy}</span>×0.4 + <span style={{ color: "#00bcd4" }}>{components.recent}</span>×0.2 = <span style={{ color: "#888" }}>{rawScore} raw</span>
            {hasWeights && rawScore !== weightedScore && (
              <span> → <span style={{ color: weightedScore < rawScore ? "#ff1744" : "#00e676" }}>{weightedScore} after your priorities</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBar({ label, icon, desc, score, weight, explanation, index }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const color = score >= 65 ? "#00e676" : score >= 35 ? "#ffab00" : "#ff1744";
  const weightLabel = weight >= 5 ? "YOUR PRIORITY" : weight <= 1 ? "LOW CONCERN" : null;
  useEffect(() => { const t = setTimeout(() => setWidth(score), 100 + index * 120); return () => clearTimeout(t); }, [score, index]);
  return (
    <div style={{ marginBottom: 4 }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "14px 16px", background: open ? "#0d0d0d" : "#080808", border: `1px solid ${open ? "#1e1e1e" : "#111"}`, borderRadius: open ? "4px 4px 0 0" : 4, cursor: "pointer", transition: "all 0.3s", boxShadow: open ? "0 0 12px #00e67622" : "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color, fontSize: 12 }}>{icon}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#777", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</span>
            {weightLabel && <span style={{ fontSize: 8, color: weight >= 5 ? "#ffab00" : "#333", letterSpacing: 1, fontFamily: "'Space Mono',monospace", border: `1px solid ${weight >= 5 ? "#ffab0033" : "#222"}`, padding: "1px 5px", borderRadius: 2 }}>{weightLabel}</span>}
            <span style={{ fontSize: 8, color: "#2a2a2a" }}>↓ details</span>
          </div>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color }}>{score}/100</span>
        </div>
        <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}66` }} />
        </div>
        <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 6, fontFamily: "'Space Mono',monospace" }}>{desc}</div>
      </div>
      {open && (
        <div style={{ padding: "16px", background: "#0a0a0a", border: "1px solid #1e1e1e", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.85, fontFamily: "'DM Sans',sans-serif" }}>{explanation || "No detailed explanation available."}</div>
        </div>
      )}
    </div>
  );
}

function ReputationBadge({ modifier, reason }) {
  if (!modifier || modifier === 0) return null;
  const bad = modifier < 0;
  return (
    <div style={{ padding: "10px 14px", marginBottom: 16, border: `1px solid ${bad ? "#ff174433" : "#00e67633"}`, borderLeft: `3px solid ${bad ? "#ff1744" : "#00e676"}`, background: bad ? "#ff174408" : "#00e67608", borderRadius: 2 }}>
      <div style={{ fontSize: 8, letterSpacing: 2, color: bad ? "#ff174466" : "#00e67666", marginBottom: 4, fontFamily: "'Space Mono',monospace" }}>{bad ? "⚠ REPUTATION MODIFIER APPLIED" : "✓ REPUTATION CREDIT APPLIED"}</div>
      <div style={{ fontSize: 12, color: bad ? "#cc5555" : "#55aa77", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
        {reason} <span style={{ fontFamily: "'Space Mono',monospace", color: bad ? "#ff1744" : "#00e676" }}>({bad ? "" : "+"}{modifier} pts)</span>
      </div>
    </div>
  );
}

function LiveDataBadge({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ padding: "10px 14px", marginBottom: 16, border: "1px solid #1a3a2a", borderLeft: "3px solid #00bcd4", background: "#00bcd408", borderRadius: 2 }}>
      <div style={{ fontSize: 8, letterSpacing: 2, color: "#00bcd466", marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>◈ LIVE SOURCES CHECKED</div>
      {sources.map((s, i) => <div key={i} style={{ fontSize: 11, color: "#2a6a7a", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>· {s}</div>)}
    </div>
  );
}

function Loader() {
  const messages = ["Reading the policy...", "Checking their track record...", "Searching recent news...", "Scoring all three components...", "Almost there..."];
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const m = setInterval(() => setMsgIndex(i => (i + 1) % messages.length), 4000);
    const d = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 500);
    return () => { clearInterval(m); clearInterval(d); };
  }, []);
  return (
    <div style={{ padding: "56px 0", textAlign: "center" }}>
      <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 32px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #00e67622", animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "1px solid #00e67633", animation: "pulse 2s ease-in-out infinite 0.4s" }} />
        <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "#00e67611", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #1a1a1a", borderTop: "2px solid #00e676", animation: "spin 0.9s linear infinite" }} />
        </div>
      </div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#666", marginBottom: 6 }}>{messages[msgIndex]}{".".repeat(dots)}</div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#1e1e1e", letterSpacing: 2 }}>VIRGIL IS ON IT</div>
    </div>
  );
}

function SurveyPanel({ onComplete, existing }) {
  const [weights, setWeights] = useState(existing || { ...DEFAULT_WEIGHTS });
  const [saved, setSaved] = useState(false);
  const hex = v => v >= 4 ? "#ff1744" : v >= 3 ? "#ffab00" : "#00e676";
  const lbl = v => ["", "Don't mind", "Slightly concerned", "Concerned", "Very concerned", "Dealbreaker"][v];
  function save() { setSaved(true); setTimeout(() => onComplete(weights), 700); }
  return saved ? (
    <div style={{ padding: 24, border: "1px solid #00e676", borderRadius: 2, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00e676", letterSpacing: 2 }}>✓ PREFERENCES SAVED</div>
  ) : (
    <div>
      <div style={{ padding: "12px 16px", background: "#0a0a0a", border: "1px solid #1a3a1a", borderLeft: "3px solid #00e676", borderRadius: 2, marginBottom: 28 }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#667766", lineHeight: 1.7 }}>
          Mark something as a Dealbreaker and it pulls the overall score down much harder when that area is weak. This uses real math — not a vague nudge.
        </div>
      </div>
      {SURVEY_QUESTIONS.map(q => (
        <div key={q.key} style={{ marginBottom: 20, padding: 16, border: "1px solid #111", borderRadius: 2, background: "#080808" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#bbb" }}>{q.label}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: hex(weights[q.key]) }}>{lbl(weights[q.key])}</span>
          </div>
          <input type="range" min={1} max={5} value={weights[q.key]}
            onChange={e => setWeights(p => ({ ...p, [q.key]: +e.target.value }))}
            style={{ width: "100%", accentColor: hex(weights[q.key]), cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 8, color: "#222", fontFamily: "'Space Mono',monospace" }}>Don't mind</span>
            <span style={{ fontSize: 8, color: "#222", fontFamily: "'Space Mono',monospace" }}>Dealbreaker</span>
          </div>
        </div>
      ))}
      <button onClick={save}
        style={{ marginTop: 8, padding: "12px 28px", background: "transparent", border: "1px solid #00e676", color: "#00e676", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", borderRadius: 2 }}
        onMouseOver={e => e.target.style.background = "#00e67611"}
        onMouseOut={e => e.target.style.background = "transparent"}
      >Save Preferences →</button>
    </div>
  );
}

function BetaSurveyPanel() {
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Help us improve Virgil.</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 32 }}>
        You're one of our first beta users. Your feedback directly shapes what Virgil becomes. Takes 2 minutes.
      </p>
      <div style={{ padding: 28, border: "1px solid #1a3a1a", borderLeft: "3px solid #00e676", background: "#080808", borderRadius: 4 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#00e67644", fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>BETA FEEDBACK SURVEY</div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#888", lineHeight: 1.8, marginBottom: 24 }}>
          Tell us what's working, what isn't, and what you'd like to see next. Your answers go directly to the team building Virgil.
        </div>
        <a href="https://forms.gle/ndmKRhMczuFhRcHf6" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "12px 28px", border: "1px solid #00e676", color: "#00e676", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", borderRadius: 3, textDecoration: "none", background: "transparent" }} onMouseOver={e => e.currentTarget.style.background = "#00e67611"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Take the Survey →</a>
      </div>
    </div>
  );
}

const SYSTEM_PROMPT = `You are Virgil — a privacy policy analysis engine. Principle: "guilty until proven innocent."

CRITICAL: You must score THREE components SEPARATELY. This is mandatory for consistent, trustworthy results.

COMPONENT 1 — HISTORICAL REPUTATION (score 0-100):
Based purely on the company's documented track record from your training knowledge. GDPR fines, FTC settlements, data breaches, Cambridge Analytica-type scandals, known data broker relationships, ad-targeting business model. This score should be STABLE — it doesn't change based on one recent article. For companies with no track record, use their service type baseline.

COMPONENT 2 — POLICY ANALYSIS (score 0-100):
Based purely on what the current published privacy policy actually says. Score vagueness heavily. Silence = worst case. "May share with partners" = penalty. Look for: data collection scope, selling clauses, third party sharing, retention periods, user deletion rights, security commitments.

COMPONENT 3 — RECENT NEWS (score 0-100):
Search "[company] privacy breach fine government contract 2024 2025" for ONE focused search. Score based only on what you find from the last 90 days. If nothing significant found, score 50 (neutral). This component should INFLUENCE but never dominate.

BASELINES by service type:
- Social media / ad-funded: 25
- E-commerce: 35
- SaaS / productivity: 50
- Healthcare / finance: 40
- Unknown / small: 55

Anthropic gets the same treatment as anyone else. No exemptions.
VAGUENESS = heavy penalty. PLAIN ENGLISH throughout — 14-year-old reading level.

Return ONLY valid JSON, no markdown:
{
  "serviceName": "string",
  "serviceType": "social_media|ecommerce|saas|healthcare|finance|unknown",
  "baselineScore": <service type baseline>,
  "components": {
    "historical": <0-100>,
    "policy": <0-100>,
    "recent": <0-100>
  },
  "componentNotes": {
    "historical": "plain English: what shaped this score",
    "policy": "plain English: what in the policy shaped this score",
    "recent": "plain English: what recent news was found or why neutral"
  },
  "reputationModifier": <0 or negative integer>,
  "reputationReason": "specific cited events or null",
  "liveDataSources": ["headline or source found"],
  "categories": {
    "dataCollection": <0-100>,
    "dataSelling": <0-100>,
    "thirdParty": <0-100>,
    "retention": <0-100>,
    "userRights": <0-100>,
    "security": <0-100>
  },
  "categoryExplanations": {
    "dataCollection": "plain English",
    "dataSelling": "plain English",
    "thirdParty": "plain English",
    "retention": "plain English",
    "userRights": "plain English",
    "security": "plain English"
  },
  "summary": "3-4 plain sentences a teenager understands",
  "verdict": "one blunt sentence",
  "redFlags": [
    {"title": "short", "explanation": "plain English real-life impact"},
    {"title": "short", "explanation": "plain English"},
    {"title": "short", "explanation": "plain English"}
  ],
  "positives": [{"title": "short", "explanation": "plain English"}],
  "dataTypes": ["type1","type2","type3"],
  "bottomLine": "single most important plain honest sentence"
}`;

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [inputMode, setInputMode] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const resultRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" });
  }, [result]);

  const rawScore = result ? computeFinalScore(result.components) : null;
  const weightedScore = result ? applyWeights(result.categories, weights) : null;
  const hasCustomWeights = Object.values(weights).some(v => v !== 3);

  async function analyze() {
    const content = inputMode === "url" ? urlInput.trim() : textInput.trim();
    if (!content) return;
    setLoading(true); setResult(null); setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 50000);
    const userMsg = inputMode === "url"
      ? `Analyze the privacy policy for: ${content}. Score the three components separately as instructed.`
      : `Analyze this privacy policy. Identify the company, then score the three components separately:\n\n${content.substring(0, 8000)}`;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: userMsg }]
        })
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const textBlocks = (data.content || []).filter(b => b.type === "text");
      const fullText = textBlocks.map(b => b.text).join("");
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not read the response — please try again");
      setResult(JSON.parse(jsonMatch[0]));
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        setError("Timed out after 50s. Try pasting the policy text directly instead of a URL.");
      } else {
        setError(`Analysis failed: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const mono = "'Space Mono',monospace";
  const sans = "'DM Sans',sans-serif";

  const TABS = [
    ["analyze",  "Analyze"],
    ["concerns", `My Concerns${hasCustomWeights ? " ●" : ""}`],
    ["beta",     "Beta Feedback"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e0e0e0", backgroundImage: "radial-gradient(ellipse at 10% 60%, #051a0a 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, #0d0a1a 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#1e1e1e}
        textarea,input[type=text]{background:#0a0a0a!important;color:#ccc!important;border:1px solid #1a1a1a!important;outline:none!important;font-family:'Space Mono',monospace!important;transition:border-color 0.2s!important}
        textarea:focus,input[type=text]:focus{border-color:#00e676!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.8;transform:scale(1.05)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #00e67622}50%{box-shadow:0 0 20px #00e67644}}
        @keyframes breathe{0%,100%{opacity:0.6}50%{opacity:1}}
        input[type=text]:hover{border-color:#00e67644!important}
        button:active{transform:scale(0.98)}
        a{transition:all 0.2s ease}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #0e0e0e", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#050505dd", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5, animation: "breathe 3s ease-in-out infinite" }}>VIR<span style={{ color: "#00e676", textShadow: "0 0 20px #00e67688" }}>GIL</span></div>
          <div style={{ fontSize: 8, letterSpacing: 3, color: "#555", marginTop: 1, fontFamily: mono }}>NO CORPORATIONS SPARED</div>
        </div>
        <div style={{ display: "flex", border: "1px solid #111", borderRadius: 3, overflow: "hidden" }}>
          {TABS.map(([key, label], i) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "7px 14px",
              background: tab === key ? "#00e67614" : "transparent",
              border: "none",
              borderRight: i < TABS.length - 1 ? "1px solid #111" : "none",
              color: tab === key ? "#00e676" : key === "concerns" && hasCustomWeights ? "#ffab00" : key === "beta" ? "#00e67688" : "#666",
              cursor: "pointer", fontSize: 10, letterSpacing: 1.2, fontFamily: mono
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 28px" }}>

        {/* BETA FEEDBACK TAB */}
        {tab === "beta" && <BetaSurveyPanel />}

        {/* MY CONCERNS TAB */}
        {tab === "concerns" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Your Privacy Priorities</h2>
            <p style={{ fontFamily: sans, fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.7 }}>
              These sliders directly change how Virgil calculates your score using real math. A Dealbreaker category that scores poorly will pull the overall number down significantly.
            </p>
            <SurveyPanel existing={weights} onComplete={w => { setWeights(w); setTab("analyze"); }} />
          </div>
        )}

        {/* ANALYZE TAB */}
        {tab === "analyze" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>What does this policy actually mean?</h2>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#888", lineHeight: 1.7 }}>
                Virgil scores three things separately — track record, policy text, and recent news — then combines them. No single source dominates. No company gets a free pass.
                {hasCustomWeights && <span style={{ color: "#ffab00" }}> Your personal weightings are active.</span>}
              </p>
            </div>

            <div style={{ display: "flex", border: "1px solid #111", borderRadius: 3, overflow: "hidden", width: "fit-content", marginBottom: 14 }}>
              {[["url", "Enter URL"], ["text", "Paste Text"]].map(([key, label]) => (
                <button key={key} onClick={() => setInputMode(key)} style={{ padding: "8px 18px", background: inputMode === key ? "#00e67614" : "transparent", border: "none", borderRight: key === "url" ? "1px solid #111" : "none", color: inputMode === key ? "#00e676" : "#333", cursor: "pointer", fontSize: 10, letterSpacing: 1.5, fontFamily: mono }}>{label}</button>
              ))}
            </div>

            {inputMode === "url"
              ? <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && analyze()} placeholder="https://example.com/privacy — or just type a company name" style={{ width: "100%", padding: "13px 14px", borderRadius: 3, fontSize: 12, marginBottom: 12 }} />
              : <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Paste the full privacy policy text here..." rows={8} style={{ width: "100%", padding: "13px 14px", borderRadius: 3, fontSize: 12, marginBottom: 12, resize: "vertical", lineHeight: 1.7 }} />
            }

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={analyze}
                disabled={loading || !(inputMode === "url" ? urlInput.trim() : textInput.trim())}
                style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${loading ? "#1a1a1a" : "#00e676"}`, color: loading ? "#2a2a2a" : "#00e676", cursor: loading ? "not-allowed" : "pointer", fontFamily: mono, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", borderRadius: 3, animation: loading ? "none" : "glow 2.5s ease-in-out infinite" }}
                onMouseOver={e => { if (!loading) e.target.style.background = "#00e67611"; }}
                onMouseOut={e => { e.target.style.background = "transparent"; }}
              >{loading ? "Analyzing..." : "Analyze Policy →"}</button>
              {loading && (
                <button onClick={() => abortRef.current?.abort()}
                  style={{ padding: "12px 20px", background: "transparent", border: "1px solid #ff174433", color: "#ff174477", cursor: "pointer", fontFamily: mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 3 }}
                  onMouseOver={e => { e.target.style.borderColor = "#ff1744"; e.target.style.color = "#ff1744"; }}
                  onMouseOut={e => { e.target.style.borderColor = "#ff174433"; e.target.style.color = "#ff174477"; }}
                >Cancel</button>
              )}
            </div>

            {loading && <Loader />}
            {error && <div style={{ marginTop: 24, padding: 16, border: "1px solid #ff174433", background: "#ff174408", borderRadius: 3, fontFamily: sans, fontSize: 13, color: "#cc4444", lineHeight: 1.7 }}>✗ {error}</div>}

            {result && weightedScore !== null && (
              <div ref={resultRef} style={{ marginTop: 52, animation: "fadeUp 0.5s ease" }}>

                <div style={{ padding: "28px", border: "1px solid #111", background: "#080808", borderRadius: "4px 4px 0 0", marginBottom: 2 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 8, letterSpacing: 3, color: "#222", marginBottom: 6, fontFamily: mono }}>SERVICE ANALYZED</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{result.serviceName}</div>
                      <div style={{ fontSize: 9, color: "#252525", letterSpacing: 2, fontFamily: mono, marginBottom: 18, textTransform: "uppercase" }}>
                        {result.serviceType?.replace("_", " ")} · Baseline: {result.baselineScore}/100
                      </div>
                      <LiveDataBadge sources={result.liveDataSources} />
                      <ReputationBadge modifier={result.reputationModifier} reason={result.reputationReason} />
                      <div style={{ padding: "10px 14px", marginBottom: 16, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4 }}><div style={{ fontSize: 9, letterSpacing: 2, color: "#00e67655", fontFamily: "'Space Mono',monospace" }}>◈ SCORED ACROSS TRACK RECORD · POLICY ANALYSIS · RECENT NEWS</div></div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: "#888", lineHeight: 1.9, marginBottom: 18 }}>{result.summary}</div>
                      <div style={{ padding: "12px 16px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderLeft: "3px solid #ffab00", borderRadius: 2 }}>
                        <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffab0055", fontFamily: mono, marginBottom: 4 }}>THE BOTTOM LINE</div>
                        <div style={{ fontFamily: sans, fontSize: 13, color: "#ccc", lineHeight: 1.7 }}>{result.bottomLine}</div>
                      </div>
                    </div>
                    <TrafficLight score={weightedScore} />
                  </div>
                </div>

                <div style={{ padding: "12px 28px", background: "#0a0a0a", border: "1px solid #111", borderTop: "none", marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: "#222", letterSpacing: 2, fontFamily: mono }}>VIRGIL'S VERDICT // </span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#555" }}>{result.verdict}</span>
                </div>

                <div style={{ padding: "24px 28px", background: "#080808", border: "1px solid #111", borderTop: "none", marginBottom: 2 }}>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#1e1e1e", marginBottom: 18, fontFamily: mono }}>CATEGORY SCORES — TAP EACH TO SEE WHAT IT MEANS</div>
                  {CATEGORIES.map((cat, i) => (
                    <CategoryBar key={cat.key} {...cat} score={result.categories[cat.key] || 30} weight={weights[cat.key] || 3} explanation={result.categoryExplanations?.[cat.key]} index={i} />
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
                  <div style={{ padding: 24, background: "#080808", border: "1px solid #111" }}>
                    <div style={{ fontSize: 8, letterSpacing: 3, color: "#ff174433", marginBottom: 16, fontFamily: mono }}>⚠ RED FLAGS</div>
                    {(result.redFlags || []).map((f, i) => (
                      <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "2px solid #ff174422" }}>
                        <div style={{ fontFamily: mono, fontSize: 10, color: "#cc4444", marginBottom: 5 }}>{f.title || f}</div>
                        {f.explanation && <div style={{ fontFamily: sans, fontSize: 12, color: "#664444", lineHeight: 1.75 }}>{f.explanation}</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 24, background: "#080808", border: "1px solid #111" }}>
                    <div style={{ fontSize: 8, letterSpacing: 3, color: "#00e67633", marginBottom: 16, fontFamily: mono }}>✓ WHAT THEY DO RIGHT</div>
                    {!(result.positives?.length)
                      ? <div style={{ fontFamily: sans, fontSize: 12, color: "#2a2a2a" }}>Nothing meaningful found.</div>
                      : (result.positives || []).map((p, i) => (
                        <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "2px solid #00e67622" }}>
                          <div style={{ fontFamily: mono, fontSize: 10, color: "#447755", marginBottom: 5 }}>{p.title || p}</div>
                          {p.explanation && <div style={{ fontFamily: sans, fontSize: 12, color: "#3a5545", lineHeight: 1.75 }}>{p.explanation}</div>}
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div style={{ padding: "20px 28px", background: "#080808", border: "1px solid #111", borderRadius: "0 0 4px 4px" }}>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "#1e1e1e", marginBottom: 14, fontFamily: mono }}>DATA TYPES COLLECTED</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(result.dataTypes || []).map((d, i) => (
                      <span key={i} style={{ padding: "5px 11px", border: "1px solid #1a1a1a", borderRadius: 2, fontSize: 10, color: "#444", fontFamily: mono, background: "#0d0d0d" }}>{d}</span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
