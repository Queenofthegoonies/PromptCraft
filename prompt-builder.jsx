import { useState, useCallback } from "react";

const TASK_TYPES = [
  { id: "write", label: "✍️ Writing", desc: "Emails, docs, content" },
  { id: "code", label: "💻 Code", desc: "Build, fix, explain code" },
  { id: "analyze", label: "🔍 Analyze", desc: "Data, research, summarize" },
  { id: "brainstorm", label: "💡 Brainstorm", desc: "Ideas, strategies, plans" },
  { id: "translate", label: "🌐 Translate", desc: "Language & tone conversion" },
  { id: "image", label: "🎨 Image Gen", desc: "Midjourney, DALL-E, Stable Diffusion" },
];

const OUTPUT_STYLES = ["Concise", "Detailed", "Step-by-step", "Creative", "Technical"];

const SYSTEM_PROMPT = `You are an expert AI prompt engineer. Your job is to transform rough, unclear, or poorly structured user instructions into a highly optimized prompt for AI systems.

Rules:
1. Fix grammar, spelling, and unclear phrasing WITHOUT changing the user's intent
2. Add necessary context, constraints, and output format instructions
3. Structure it clearly: Context → Task → Requirements → Output Format
4. If the task type is "image", use visual descriptor language (style, mood, lighting, composition)
5. Always preserve the user's core goal — never add assumptions that aren't implied
6. Return ONLY the optimized prompt — no explanations, no preamble, no quotes around it
7. If the user's instruction is already in another language pattern, normalize it to clear English
8. Add role-setting at the start if it improves the output (e.g., "You are a...")
9. Keep it human and direct — not robotic or overly formal`;

export default function PromptBuilder() {
  const [rawInput, setRawInput] = useState("");
  const [taskType, setTaskType] = useState("write");
  const [outputStyle, setOutputStyle] = useState("Concise");
  const [additionalContext, setAdditionalContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e) => {
    setRawInput(e.target.value);
    setCharCount(e.target.value.length);
    if (error) setError(null);
  };

  const buildPrompt = useCallback(async () => {
    if (!rawInput.trim()) {
      setError("Please enter your rough instructions first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const taskInfo = TASK_TYPES.find((t) => t.id === taskType);
    const userMessage = `Task Type: ${taskInfo.label} (${taskInfo.desc})
Output Style: ${outputStyle}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Raw Instructions:
"${rawInput}"

Transform this into an optimized AI prompt.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API request failed");
      }

      const data = await response.json();
      const text = data?.content?.find((b) => b.type === "text")?.text;
      if (!text) throw new Error("No response from AI");
      setResult(text.trim());
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [rawInput, taskType, outputStyle, additionalContext]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setRawInput("");
    setResult(null);
    setError(null);
    setAdditionalContext("");
    setCharCount(0);
    setTaskType("write");
    setOutputStyle("Concise");
  };

  return (
    <div style={styles.root}>
      <style>{cssString}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoMark}>⬡</div>
        <div>
          <h1 style={styles.title}>PromptCraft</h1>
          <p style={styles.subtitle}>Turn messy ideas into precision AI prompts</p>
        </div>
        <div style={styles.badge}>PRO BUILDER</div>
      </header>

      <div style={styles.layout}>
        {/* LEFT: Input Panel */}
        <div style={styles.panel}>
          <label style={styles.label}>
            <span style={styles.labelNum}>01</span> What do you want to do?
          </label>
          <textarea
            style={styles.textarea}
            placeholder="Just talk to me like you normally would... 'i need write email to boss about i am late project because the team no cooperate and i want ask more time but not look bad'"
            value={rawInput}
            onChange={handleInputChange}
            rows={6}
            className="textarea-focus"
          />
          <div style={styles.charCounter}>{charCount} chars</div>

          <label style={styles.label}>
            <span style={styles.labelNum}>02</span> Task type
          </label>
          <div style={styles.taskGrid}>
            {TASK_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTaskType(t.id)}
                style={{
                  ...styles.taskBtn,
                  ...(taskType === t.id ? styles.taskBtnActive : {}),
                }}
                className="task-btn"
              >
                <span style={styles.taskEmoji}>{t.label.split(" ")[0]}</span>
                <span style={styles.taskLabelText}>{t.label.split(" ").slice(1).join(" ")}</span>
              </button>
            ))}
          </div>

          <label style={styles.label}>
            <span style={styles.labelNum}>03</span> Output style
          </label>
          <div style={styles.styleRow}>
            {OUTPUT_STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setOutputStyle(s)}
                style={{
                  ...styles.styleBtn,
                  ...(outputStyle === s ? styles.styleBtnActive : {}),
                }}
                className="style-btn"
              >
                {s}
              </button>
            ))}
          </div>

          <label style={styles.label}>
            <span style={styles.labelNum}>04</span> Extra context{" "}
            <span style={styles.optional}>(optional)</span>
          </label>
          <input
            style={styles.input}
            placeholder="e.g. audience is non-technical, keep under 200 words, formal tone..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="input-focus"
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.btnRow}>
            <button
              style={styles.buildBtn}
              onClick={buildPrompt}
              disabled={loading || !rawInput.trim()}
              className="build-btn"
            >
              {loading ? (
                <span style={styles.loadingContent}>
                  <span className="spinner" style={styles.spinner}></span>
                  Crafting prompt...
                </span>
              ) : (
                "✦ Build My Prompt"
              )}
            </button>
            {(result || rawInput) && (
              <button style={styles.resetBtn} onClick={handleReset} className="reset-btn">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Output Panel */}
        <div style={styles.outputPanel}>
          <label style={styles.label}>
            <span style={styles.labelNum}>✦</span> Your Optimized Prompt
          </label>

          {!result && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>◈</div>
              <p style={styles.emptyText}>
                Your AI-ready prompt will appear here.
                <br />
                No prompt engineering skills needed.
              </p>
              <div style={styles.tips}>
                <p style={styles.tipTitle}>💡 Tips for best results:</p>
                <ul style={styles.tipList}>
                  <li>Don't worry about grammar — just say what you mean</li>
                  <li>Include who the output is for</li>
                  <li>Mention any constraints (length, tone, format)</li>
                  <li>It's OK to use your native language patterns</li>
                </ul>
              </div>
            </div>
          )}

          {loading && (
            <div style={styles.loadingState}>
              <div className="pulse-ring" style={styles.pulseRing}></div>
              <p style={styles.loadingText}>Analyzing & optimizing your prompt...</p>
            </div>
          )}

          {result && (
            <div style={styles.resultContainer}>
              <div style={styles.resultBox} className="result-box">
                <p style={styles.resultText}>{result}</p>
              </div>

              <div style={styles.resultActions}>
                <button
                  style={{ ...styles.copyBtn, ...(copied ? styles.copiedBtn : {}) }}
                  onClick={handleCopy}
                  className="copy-btn"
                >
                  {copied ? "✓ Copied!" : "⧉ Copy Prompt"}
                </button>
                <div style={styles.wordCount}>{result.split(/\s+/).length} words</div>
              </div>

              <div style={styles.compareSection}>
                <details style={styles.details}>
                  <summary style={styles.summary}>Compare: Before vs After</summary>
                  <div style={styles.compareGrid}>
                    <div style={styles.compareBox}>
                      <p style={styles.compareLabel}>YOUR INPUT</p>
                      <p style={styles.compareText}>{rawInput}</p>
                    </div>
                    <div style={{ ...styles.compareBox, ...styles.compareBoxAfter }}>
                      <p style={styles.compareLabel}>OPTIMIZED</p>
                      <p style={styles.compareText}>{result}</p>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e8e3dc",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: "0 0 60px 0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "28px 40px",
    borderBottom: "1px solid #1e1e2e",
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logoMark: {
    fontSize: "32px",
    color: "#c8b880",
    lineHeight: 1,
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    color: "#f0ebe2",
    fontFamily: "'Georgia', serif",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#6b6878",
    letterSpacing: "0.05em",
    fontFamily: "monospace",
  },
  badge: {
    marginLeft: "auto",
    background: "#c8b880",
    color: "#0a0a0f",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.15em",
    padding: "4px 10px",
    fontFamily: "monospace",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px",
    alignItems: "start",
  },
  panel: {
    paddingRight: "40px",
    borderRight: "1px solid #1e1e2e",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.12em",
    color: "#8a8598",
    textTransform: "uppercase",
    marginBottom: "12px",
    marginTop: "28px",
    fontFamily: "monospace",
  },
  labelNum: {
    color: "#c8b880",
    fontWeight: "700",
  },
  optional: {
    color: "#4a4758",
    fontWeight: "400",
    textTransform: "none",
    fontSize: "10px",
  },
  textarea: {
    width: "100%",
    background: "#0f0f18",
    border: "1px solid #2a2a3e",
    color: "#d8d3cc",
    fontFamily: "'Georgia', serif",
    fontSize: "14px",
    lineHeight: "1.7",
    padding: "16px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  charCounter: {
    textAlign: "right",
    fontSize: "10px",
    color: "#3a3848",
    marginTop: "4px",
    fontFamily: "monospace",
  },
  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  taskBtn: {
    background: "#0f0f18",
    border: "1px solid #2a2a3e",
    color: "#6b6878",
    padding: "10px 8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.15s",
    fontFamily: "monospace",
  },
  taskBtnActive: {
    background: "#1a1a28",
    border: "1px solid #c8b880",
    color: "#c8b880",
  },
  taskEmoji: {
    fontSize: "16px",
  },
  taskLabelText: {
    fontSize: "10px",
    letterSpacing: "0.05em",
  },
  styleRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  styleBtn: {
    background: "transparent",
    border: "1px solid #2a2a3e",
    color: "#6b6878",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "monospace",
    transition: "all 0.15s",
    letterSpacing: "0.05em",
  },
  styleBtnActive: {
    background: "#c8b880",
    border: "1px solid #c8b880",
    color: "#0a0a0f",
  },
  input: {
    width: "100%",
    background: "#0f0f18",
    border: "1px solid #2a2a3e",
    color: "#d8d3cc",
    fontFamily: "'Georgia', serif",
    fontSize: "13px",
    padding: "12px 16px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  error: {
    background: "#1a0f0f",
    border: "1px solid #4a2020",
    color: "#c87070",
    padding: "10px 14px",
    fontSize: "12px",
    marginTop: "16px",
    fontFamily: "monospace",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
    alignItems: "center",
  },
  buildBtn: {
    flex: 1,
    background: "#c8b880",
    border: "none",
    color: "#0a0a0f",
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    transition: "all 0.2s",
  },
  resetBtn: {
    background: "transparent",
    border: "1px solid #2a2a3e",
    color: "#4a4758",
    padding: "14px 18px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    transition: "all 0.15s",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #0a0a0f",
    borderTopColor: "transparent",
    borderRadius: "50%",
  },
  outputPanel: {
    paddingLeft: "40px",
    position: "sticky",
    top: "100px",
  },
  emptyState: {
    border: "1px dashed #2a2a3e",
    padding: "40px 30px",
    textAlign: "center",
    marginTop: "0",
  },
  emptyIcon: {
    fontSize: "36px",
    color: "#3a3848",
    marginBottom: "16px",
  },
  emptyText: {
    color: "#4a4758",
    fontSize: "13px",
    lineHeight: "1.7",
    fontFamily: "monospace",
    margin: "0 0 24px",
  },
  tips: {
    textAlign: "left",
    background: "#0f0f18",
    border: "1px solid #1e1e2e",
    padding: "16px 20px",
  },
  tipTitle: {
    margin: "0 0 10px",
    fontSize: "11px",
    color: "#c8b880",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },
  tipList: {
    margin: 0,
    padding: "0 0 0 16px",
    color: "#5a5868",
    fontSize: "12px",
    lineHeight: "1.8",
    fontFamily: "monospace",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 30px",
    gap: "20px",
  },
  pulseRing: {
    width: "48px",
    height: "48px",
    border: "2px solid #c8b880",
    borderRadius: "50%",
  },
  loadingText: {
    color: "#6b6878",
    fontSize: "12px",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultBox: {
    background: "#0f0f18",
    border: "1px solid #c8b880",
    padding: "24px",
    position: "relative",
  },
  resultText: {
    margin: 0,
    color: "#e8e3dc",
    fontSize: "14px",
    lineHeight: "1.8",
    fontFamily: "'Georgia', serif",
    whiteSpace: "pre-wrap",
  },
  resultActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyBtn: {
    background: "#1a1a28",
    border: "1px solid #3a3a5e",
    color: "#c8b880",
    padding: "10px 20px",
    fontSize: "12px",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  copiedBtn: {
    background: "#1a2a1a",
    border: "1px solid #4a7a4a",
    color: "#80c880",
  },
  wordCount: {
    fontSize: "10px",
    color: "#3a3848",
    fontFamily: "monospace",
  },
  compareSection: {
    borderTop: "1px solid #1e1e2e",
    paddingTop: "16px",
  },
  details: {
    cursor: "pointer",
  },
  summary: {
    fontSize: "11px",
    color: "#4a4758",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    userSelect: "none",
    outline: "none",
    marginBottom: "12px",
  },
  compareGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "12px",
  },
  compareBox: {
    background: "#0a0a0f",
    border: "1px solid #1e1e2e",
    padding: "14px",
  },
  compareBoxAfter: {
    border: "1px solid #2a3a2a",
    background: "#0a0f0a",
  },
  compareLabel: {
    margin: "0 0 8px",
    fontSize: "9px",
    letterSpacing: "0.15em",
    color: "#4a4758",
    fontFamily: "monospace",
    fontWeight: "700",
  },
  compareText: {
    margin: 0,
    fontSize: "11px",
    color: "#5a5868",
    lineHeight: "1.6",
    fontFamily: "'Georgia', serif",
  },
};

const cssString = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

  * { box-sizing: border-box; }
  
  .textarea-focus:focus, .input-focus:focus {
    border-color: #c8b880 !important;
  }
  
  .build-btn:hover:not(:disabled) {
    background: #d4c890 !important;
    transform: translateY(-1px);
  }
  
  .build-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .reset-btn:hover {
    border-color: #4a4758 !important;
    color: #8a8598 !important;
  }

  .task-btn:hover {
    border-color: #4a4060 !important;
    color: #9a9aa8 !important;
  }

  .style-btn:hover {
    border-color: #4a4060 !important;
    color: #9a9aa8 !important;
  }

  .copy-btn:hover {
    background: #202030 !important;
  }

  .result-box::before {
    content: '✦ OPTIMIZED PROMPT';
    position: absolute;
    top: -1px;
    left: 16px;
    background: #c8b880;
    color: #0a0a0f;
    font-size: 9px;
    font-family: monospace;
    font-weight: 800;
    letter-spacing: 0.15em;
    padding: 2px 8px;
    transform: translateY(-50%);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spinner { animation: spin 0.8s linear infinite; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.95); }
  }
  .pulse-ring { animation: pulse 1.5s ease-in-out infinite; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .result-box { animation: fadeIn 0.3s ease-out; }

  @media (max-width: 768px) {
    .layout { grid-template-columns: 1fr !important; }
  }

  details > summary { list-style: none; }
  details > summary::-webkit-details-marker { display: none; }
`;
