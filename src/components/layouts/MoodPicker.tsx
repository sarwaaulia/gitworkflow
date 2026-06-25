"use client";

import { useEntry } from "@/app/context/EntryContex";

const moods = [
    { emoticon: "🙂", label: "neutral" },
    { emoticon: "😊", label: "happy" },
    { emoticon: "🤩", label: "excited" },
    { emoticon: "🥰", label: "love" },
    { emoticon: "🤣", label: "very_happy" },
    { emoticon: "😭", label: "very_sad" },
    { emoticon: "😡", label: "angry" },
    { emoticon: "😰", label: "anxious" },
    { emoticon: "🙏", label: "grateful" },
    { emoticon: "😎", label: "proud" },
    { emoticon: "🥺", label: "touched" },
    { emoticon: "🔥", label: "on fire" },
    { emoticon: "🤔", label: "thinking" },
    { emoticon: "😕", label: "confused" },
    { emoticon: "😴", label: "tired" },
    { emoticon: "🙄", label: "boredom" },
];

export default function MoodPicker() {
    const { selectedMood, setSelectedMood, moodIntensity, setMoodIntensity } = useEntry();

    return (
        <div className="space-y-5 p-5 rounded-2xl bg-surface border border-border-muted shadow-sm transition-colors">
            <label className="text-sm font-bold text-text-primary block">How are you feeling?</label>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-4 gap-3">
                {moods.map((m) => {
                    const isActive = selectedMood?.label === m.label;
                    return (
                        <button
                            key={m.label}
                            type="button"
                            onClick={() => setSelectedMood(m)}
                            title={m.label}
                            className={`text-2xl rounded transition-all duration-200 transform hover:scale-110 flex items-center justify-center align-center ${
                                isActive 
                                ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20 scale-105 border-transparent' 
                                : 'bg-bg-main border border-border-muted hover:border-brand-purple/50'
                            }`}
                        >
                            {m.emoticon}
                        </button>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-border-muted/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mood Intensity</span>
                    <span className="text-sm font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-lg">
                        {moodIntensity}/10
                    </span>
                </div>
                <input
                    type="range" 
                    min={1} 
                    max={10}
                    value={moodIntensity}
                    onChange={(e) => setMoodIntensity(+e.target.value)}
                    className="w-full h-2 bg-border-muted rounded-lg appearance-none cursor-pointer accent-brand-purple transition-all"
                />
            </div>
        </div>
    );
}