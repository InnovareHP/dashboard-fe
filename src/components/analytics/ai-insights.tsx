import { Sparkles, Target, TrendingUp, Users, Zap } from "lucide-react";

type AIInsights = {
  title: string;
  items: string[];
};
type Props = {
  insights: AIInsights[];
};

const getIconForTitle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("trend")) return TrendingUp;
  if (lowerTitle.includes("people") || lowerTitle.includes("contact"))
    return Users;
  if (lowerTitle.includes("recommendation") || lowerTitle.includes("action"))
    return Target;
  return Zap;
};

export function AIInsights({ insights }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 shadow-xl border border-indigo-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Insights
            </h2>
            <p className="text-sm text-gray-600">
              Real-time analytics and recommendations
            </p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map(({ title, items }) => {
            const Icon = getIconForTitle(title);
            return (
              <div
                key={title}
                className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-indigo-200 hover:-translate-y-1"
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg flex-1">
                    {title}
                  </h3>
                </div>

                {/* Items */}
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-1.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover gradient effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
