import { Sparkles } from "lucide-react";

type AIInsights = {
  title: string;
  items: string[];
};
type Props = {
  insights: AIInsights[];
};

export function AIInsights({ insights }: Props) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
        <Sparkles className="h-4 w-4" />
        AI Insights
      </div>

      {insights.map(({ title, items }) => (
        <div key={title} className="space-y-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>

          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
