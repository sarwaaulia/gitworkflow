"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Topbar from "@/components/layouts/Topbar";
import Sidebar from "@/components/layouts/Sidebar";
import { getEntries } from "./server";
import { getCurrentUser } from "@/lib/auth/server";
import { signOut } from "@/app/auth/signOut/route";
import { TrendingUp, Search, Filter, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

type JournalEntry = {
	id: string;
	content: string;
	mood?: string;
	tags?: string[];
	created_at: string;
	moodIntensity?: number;
	category?: {
		name: string;
		color?: string;
	};
};

export const MOODS_VARIANT = [
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

export default function DashboardPage() {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [user, setUser] = useState<{ name: string; email: string } | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const { isDarkMode } = useTheme();

	const [isSideBarOpen, setIsSideBarOpen] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedMood, setSelectedMood] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [sortBy, setSortBy] = useState("date_desc");

	const fetchFilteredData = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				query: searchQuery,
				mood: selectedMood,
				category: selectedCategory,
				sDate: startDate,
				eDate: endDate,
				relevance: sortBy,
			});

			const res = await fetch(`/api/search?${params.toString()}`);
			const result = await res.json();

			if (result.entries) {
				setEntries(result.entries);
			}
		} catch (err) {
			console.error("Gagal mengambil data terfilter", err);
		} finally {
			setLoading(false);
		}
	}, [searchQuery, selectedMood, selectedCategory, startDate, endDate, sortBy]);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchFilteredData();
		}, 500);
		return () => clearTimeout(delayDebounce);
	}, [fetchFilteredData]);

	useEffect(() => {
		const refreshData = async () => {
			try {
				setLoading(true);

				const [userData, entriesData] = await Promise.all([
					getCurrentUser(),
					getEntries(),
				]);

				if (userData && userData.email) {
					setUser({ name: userData.name, email: userData.email }); //update state user for sync with topbar
				}

				setEntries(Array.isArray(entriesData) ? entriesData : []);
			} catch (err) {
				console.error(err);
				setEntries([]);
			} finally {
				setLoading(false);
			}
		};
		refreshData();
	}, []);

	const stats = useMemo(() => {
		const safeEntries = Array.isArray(entries) ? entries : [];

		if (safeEntries.length === 0) return { entriesThisWeek: 0, streak: 0 };

		const now = new Date();
		const startOfWeek = new Date(
			now.setDate(now.getDate() - now.getDay()),
		).setHours(0, 0, 0, 0);

		const entriesThisWeek = safeEntries.filter(
			(e) => e.created_at && new Date(e.created_at).getTime() >= startOfWeek,
		).length;

		const sortedDates = [
			...new Set(safeEntries.map((e) => new Date(e.created_at).toDateString())),
		]
			.map((d) => new Date(d))
			.sort((a, b) => b.getTime() - a.getTime());

		let streak = 0;
		let checkDate = new Date();
		checkDate.setHours(0, 0, 0, 0);

		for (const date of sortedDates) {
			const diff = Math.floor(
				(checkDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
			);
			if (diff === 0) {
				streak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else if (diff > 1) break;
		}

		return { entriesThisWeek, streak };
	}, [entries]);

	const filteredEntries = useMemo(() => {
		return entries
			.filter((entry) => {
				const entryDate = new Date(entry.created_at).getTime();
				const start = startDate
					? new Date(startDate).setHours(0, 0, 0, 0)
					: null;
				const end = endDate
					? new Date(endDate).setHours(23, 59, 59, 999)
					: null;

				const matchesSearch =
					!searchQuery ||
					entry.content.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesMood = !selectedMood || entry.mood === selectedMood;
				const matchesCategory =
					!selectedCategory || entry.tags?.includes(selectedCategory);
				const matchesDate =
					(!start || entryDate >= start) && (!end || entryDate <= end);

				return matchesSearch && matchesMood && matchesCategory && matchesDate;
			})
			.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return sortBy === "date_desc" ? dateB - dateA : dateA - dateB;
			});
	}, [
		entries,
		searchQuery,
		selectedMood,
		selectedCategory,
		startDate,
		endDate,
		sortBy,
	]);

	if (loading)
		return (
			<div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
				<div className="animate-spin h-10 w-10 rounded-full border-t-2 border-indigo-600" />
			</div>
		);

	return (
		<div
			className={`min-h-screen flex ${isDarkMode ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900"}`}
		>
			<Sidebar isOpen={isSideBarOpen} onClose={() => setIsSideBarOpen(false)} />

			<div className="flex-1 flex flex-col min-w-0">
				<Topbar
					isLandingPage={false}
					user={user}
					onLogout={signOut}
					isSideBarOpen={isSideBarOpen}
					onToggleSidebar={() => setIsSideBarOpen(!isSideBarOpen)}
				/>

				<main className="flex-1 px-6 md:px-12 py-10 max-w-[1400px] mx-auto w-full">
					<header className="mb-12">
						<h1 className="text-3xl font-bold">
							Welcome back, {user?.name}! 👋
						</h1>
						<p className="mt-2 text-text-secondary font-semibold">
							Track your emotional journey with this smart journal.
						</p>
					</header>

					{/* stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
						<StatCard
							icon={<TrendingUp className="text-emerald-500" size={20} />}
							label="Total Entries"
							value={entries.length}
							subValue={`+${stats.entriesThisWeek} this week`}
						/>
						<StatCard
							icon={<span>🔥</span>}
							label="Current Streak"
							value={`${stats.streak} Days`}
							subValue="Keep it up!"
						/>
						<StatCard
							icon={<span>🤖</span>}
							label="AI Insights"
							value={entries.length > 3 ? "Analysis Ready" : "Need More Data"}
							subValue={
								entries.length > 3
									? "Patterns updated"
									: `Add ${4 - entries.length} more`
							}
						/>
					</div>

					{/* search and filter */}
					<div className="space-y-4 mb-10">
						<div className="flex gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
								<input
									type="text"
									placeholder="Search your thoughts..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border-muted bg-surface text-text-primary outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
								/>
							</div>
							<button
								onClick={() => setShowFilters(!showFilters)}
								className={`p-3.5 rounded-2xl border transition-all ${showFilters ? "bg-brand-purple text-white border-brand-purple" : "bg-surface text-text-secondary border-border-muted"}`}
							>
								<Filter size={20} />
							</button>
						</div>

						{showFilters && (
							<div className="p-6 rounded-2xl bg-surface border border-border-muted grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
								<FilterSelect
									label="Mood"
									value={selectedMood}
									onChange={setSelectedMood}
								>
									<option value="">All Moods</option>
									{MOODS_VARIANT.map((m) => (
										<option key={m.label} value={m.label}>
											{m.emoticon} {m.label}
										</option>
									))}
								</FilterSelect>
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-bold text-text-secondary uppercase">
										From
									</label>
									<input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="w-full p-2 bg-bg-main border border-border-muted rounded-xl text-sm text-text-primary"
									/>
								</div>
								<div className="flex items-end gap-2">
									<div className="flex-1 flex flex-col gap-1">
										<label className="text-[11px] font-bold text-text-secondary uppercase">
											To
										</label>
										<input
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className="w-full p-2 bg-bg-main border border-border-muted rounded-xl text-sm text-text-primary"
										/>
									</div>
									<button
										onClick={() => {
											setSearchQuery("");
											setSelectedMood("");
											setSelectedCategory("");
											setStartDate("");
											setEndDate("");
										}}
										className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
									>
										<X size={18} />
									</button>
								</div>
							</div>
						)}
					</div>

					{/* entries */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-bold tracking-tight">
								Recent Entries
							</h2>
							<div className="flex items-center gap-2">
								<span className="text-xs text-text-secondary font-medium">
									Sort by:
								</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="bg-transparent text-sm text-brand-purple font-bold outline-none cursor-pointer"
								>
									<option value="date_desc">Newest</option>
									<option value="date_asc">Oldest</option>
								</select>
							</div>
						</div>

						{filteredEntries.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
								{filteredEntries.slice(0, 3).map((entry) => (
									<RecentEntryCard key={entry.id} entry={entry} />
								))}
							</div>
						) : (
							<div className="text-center py-20 bg-surface/50 rounded-3xl border-2 border-dashed border-border-muted">
								<h3 className="text-lg font-medium text-text-secondary">
									There are no journal entries yet.
								</h3>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}

function RecentEntryCard({ entry }: { entry: JournalEntry }) {
	const moodData = MOODS_VARIANT.find(
		(m) => m.emoticon === entry.mood || m.label === entry.mood,
	);
	const formatDate = (dateString: string) => {
		if (!dateString) return "No Date";
		const d = new Date(dateString);
		return isNaN(d.getTime())
			? "Invalid Date"
			: d.toLocaleDateString("id-ID", {
					day: "numeric",
					month: "short",
					year: "numeric",
				});
	};

	return (
		<Link
			href={`/entries/new`}
			className="group block p-6 rounded-2xl border border-border-muted bg-surface transition-all hover:-translate-y-1 hover:shadow hover:border-brand-purple/40"
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<span className="text-2xl">{moodData?.emoticon || "📝"}</span>
					<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
						{moodData?.label || "Unlabeled"}
					</span>
				</div>
			</div>
			<span className="text-[10px] font-medium text-text-secondary">
				{formatDate(entry.created_at)}
			</span>
			<p className="text-text-primary text-sm leading-relaxed line-clamp-3 mb-6 font-medium italic">
				"{entry.content}"
			</p>

			<div className="flex items-center justify-between pt-4 border-t border-border-muted/50">
				<div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
				</div>
				<div className="flex items-center gap-1 text-indigo-500 text-[11px] font-bold opacity-0 group-hover:opacity-90 transition-opacity">
					View <ArrowRight size={12} />
				</div>
			</div>
		</Link>
	);
}

function StatCard({ icon, label, value, subValue }: any) {
	return (
		<div className="p-8 rounded-3xl border border-border-muted bg-surface shadow-sm transition-all hover:shadow-md">
			<div className="w-12 h-12 rounded-2xl bg-bg-main border border-border-muted flex items-center justify-center mb-6 text-xl">
				{icon}
			</div>
			<p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
				{label}
			</p>
			<h3 className="text-3xl font-bold mt-2 tracking-tight text-text-primary">
				{value}
			</h3>
			<p className="text-xs mt-3 text-brand-purple font-semibold">{subValue}</p>
		</div>
	);
}

function FilterSelect({ label, value, onChange, children }: any) {
	return (
		<div>
			<label className="text-[11px] font-bold text-text-secondary uppercase">
				{label}
			</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full p-2 bg-bg-main border border-border-muted rounded-xl text-sm font-medium text-text-primary outline-none focus:border-brand-purple"
			>
				{children}
			</select>
		</div>
	);
}
