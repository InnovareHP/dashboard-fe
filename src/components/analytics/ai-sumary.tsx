import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

function useTypewriter(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return setDisplayed("");

    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return displayed;
}

function trimObject(obj: any, maxKeys = 5) {
  if (typeof obj !== "object" || obj === null) return obj;
  const keys = Object.keys(obj);
  if (keys.length <= maxKeys) return obj;
  const trimmed: any = {};
  keys.slice(0, maxKeys).forEach((key) => (trimmed[key] = obj[key]));
  return trimmed;
}

function renderAIContent(content: any): React.ReactNode {
  const formatKey = (key: string) =>
    key
      .replace(/_/g, " ") // replace underscores
      .replace(
        /\w\S*/g,
        (
          w // capitalize every word
        ) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );

  if (typeof content === "string") {
    return <p className="text-sm text-muted-foreground">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="list-disc ml-4 text-sm text-muted-foreground space-y-1">
        {content.map((item, i) => (
          <li key={i}>{renderAIContent(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof content === "object" && content !== null) {
    return (
      <div className="ml-2 space-y-3">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-semibold text-sm">{formatKey(key)}</h4>
            <div className="ml-3">{renderAIContent(value)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <p>{String(content)}</p>;
}

export default function AiSummary({
  isLoadingSummary,
  summary,
}: {
  isLoadingSummary: boolean;
  summary: any;
}) {
  const [expanded, setExpanded] = useState(false);

  const summaryStr = summary ? JSON.stringify(summary) : "";
  const isLong = summaryStr.length > 600;

  const shownSummary = expanded ? summary : trimObject(summary, 5);
  const typewriterRaw = JSON.stringify(shownSummary);

  const typed = useTypewriter(typewriterRaw);

  let parsed: any = shownSummary;
  try {
    parsed = JSON.parse(typed);
  } catch {
    // partial JSON while typing
  }

  return (
    <Card className="border border-purple-300">
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Loading */}
        {isLoadingSummary && !summary && (
          <p className="text-sm text-purple-700 animate-pulse">
            Dashboard is thinking... Generating insights based on your analytics
            data.
          </p>
        )}

        {/* Render object */}
        {!isLoadingSummary && summary && (
          <div className="space-y-4">
            {renderAIContent(parsed)}

            {/* Show more toggle */}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 underline text-sm"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
