import { getInsightFromUser } from "./server";
import { GenerateBtn } from "./generateBtn";
import Topbar from "@/components/layouts/Topbar";
import Sidebar from "@/components/layouts/Sidebar";
import { Sparkles, Calendar, Target, Activity, AlertCircle } from "lucide-react";

type MoodsCount = {
    mood: string;
    count: number;
};

type WeeklyInsight = {
    id: string;
    summary: string;
    topThemes: string[];
    moodTrend: MoodsCount[];
    createdAt: string;
};

export default async function InsightAI() {
    const resultInsight = await getInsightFromUser();

    if (resultInsight.error) {
        return (
            <div className="flex min-h-screen bg-bg-main">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-red-500/20 bg-red-500/5">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
                        <p className="text-sm text-text-secondary leading-relaxed">{resultInsight.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const insights = resultInsight.data as WeeklyInsight[];

    const generateColorMoods = (mood: string) => {
        const colors: Record<string, string> = {
            Happy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            Neutral: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            Sad: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            Angry: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            Anxious: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
            Stressed: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            Excited: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
            Grateful: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
        };
        return colors[mood] || "bg-surface text-text-secondary border-border-muted";
    };

    return (
        <div className="flex min-h-screen bg-bg-main text-text-primary">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-12">
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-brand-purple font-bold mb-1">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-xs uppercase tracking-[0.2em]">AI Analysis</span>
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight">
                                    Personal <span className="text-brand-purple">Insights</span>
                                </h1>
                                <p className="text-text-secondary text-lg">
                                    Understanding your patterns through the lens of AI.
                                </p>
                            </div>
                            <div className="flex">
                                <GenerateBtn />
                            </div>
                        </div>

                        {insights.length === 0 ? (
                            <div className="relative overflow-hidden border-2 border-dashed border-border-muted rounded-[2rem] p-16 text-center bg-surface/50 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-bg-main rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Activity className="w-10 h-10 text-brand-purple opacity-40" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">No insights discovered yet</h3>
                                <p className="text-text-secondary max-w-sm mx-auto mb-10 text-sm leading-relaxed">
                                    Share your thoughts for a few days, then generate your analysis to see your growth.
                                </p>
                                <GenerateBtn />
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {insights.map((insight) => (
                                    <section key={insight.id} className="group">
                                        <div className="flex items-center gap-4 mb-6 text-text-secondary/60">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">
                                                Week of {new Date(insight.createdAt).toLocaleDateString("en-US", {
                                                    month: "long", day: "numeric", year: "numeric"
                                                })}
                                            </span>
                                            <div className="h-px flex-1 bg-border-muted" />
                                        </div>

                                        <div className="bg-surface border border-border-muted rounded-[2.5rem] p-8 md:p-10 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-purple/5 transition-all duration-500">
                                            <div className="mb-10">
                                                <p className="text-lg md:text-2xl text-text-primary opacity-90">
                                                    "{insight.summary}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-border-muted/50">
                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <Target className="w-5 h-5 text-brand-purple" />
                                                        <h4 className="text-sm font-black uppercase tracking-widest">Top Themes</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {insight.topThemes.map((theme) => (
                                                            <span key={theme} className="px-4 py-2 rounded-2xl text-xs font-bold  text-brand-purple border border-border-muted shadow-sm hover:border-brand-purple/40 transition-colors">
                                                                #{theme}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <Activity className="w-5 h-5 text-accent-blue" />
                                                        <h4 className="text-sm font-black uppercase tracking-widest">Mood Distribution</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {insight.moodTrend.map(({ mood, count }) => (
                                                            <div key={mood} className={`flex items-center gap-3 px-4 py-2 rounded-2xl border text-xs font-black shadow-sm ${generateColorMoods(mood)}`}>
                                                                <span className="font-bold text-brand-purple">{mood}</span>
                                                                <span className="w-5 h-5 flex items-center justify-center text-brand-purple bg-white/20 rounded-lg text-xs">{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}