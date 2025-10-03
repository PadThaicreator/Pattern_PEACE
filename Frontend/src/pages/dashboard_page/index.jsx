import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api";
import { formatDate } from "../../utility/formatTime";

const KNOWN_TYPES = ["TOXIC", "OBSCENE", "THREAT", "INSULT", "IDENTITY_HATE"];
const NON_TOXIC_KEYS = ["NON TOXIC", "NON_TOXIC", "NONTOXIC", "NON-TOXIC"];

function parseTypes(raw) {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw;
	if (typeof raw === "string") {
		const found = KNOWN_TYPES.filter((t) => raw.includes(t));
		return found.length ? found : [raw];
	}
	return [];
}

function formatCategoryLabel(key) {
    if (!key) return "";
    const normalized = key.toString().replaceAll("_", " ").toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function monthKey(dateStr) {
	const d = new Date(dateStr);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

function BarChart({ data, height = 160, barColor = "#60a5fa" }) {
	const entries = Object.entries(data || {});
	const maxVal = Math.max(1, ...entries.map(([, v]) => v));
	const barWidth = 40;
	const gap = 20;
	const width = entries.length * (barWidth + gap) + gap;
	return (
		<div style={{ overflowX: "auto" }}>
			<svg width={width} height={height} style={{ display: "block" }}>
				{entries.map(([label, value], idx) => {
					const h = Math.max(2, (value / maxVal) * (height - 40));
					const x = gap + idx * (barWidth + gap);
					const y = height - h - 20;
					return (
						<g key={label}>
							<rect x={x} y={y} width={barWidth} height={h} fill={barColor} rx={6} />
							<text x={x + barWidth / 2} y={height - 5} textAnchor="middle" fontSize="10">
								{label}
							</text>
							<text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#374151">
								{value}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

export default function DashboardPage() {
	const user = useSelector((state) => state.user.user);
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [selectedPlatforms, setSelectedPlatforms] = useState([]);

	useEffect(() => {
		if (!user || !user.id) return;
		(async () => {
			try {
				setLoading(true);
				setError("");
				const res = await api.get(`/api/reports/`);
				setReports(res.data || []);
			} catch (err) {
				const msg = err?.response?.data?.message || err?.message || "Unknown error";
				setError(msg);
			} finally {
				setLoading(false);
			}
		})();
	}, [user?.id]);

	const normalizePlatform = (raw) => {
		const key = (raw || "").toString().toLowerCase();
		if (!key) return "unknown";
		if (key.includes("facebook")) return "facebook";
		if (key.includes("reddit")) return "reddit";
		if (key.includes("twitter") || key === "x") return "twitter";
		if (key.includes("stack") || key.includes("overflow")) return "stackoverflow";
		return raw;
	};

	const displayPlatform = (key) => {
		switch (key) {
			case "facebook":
				return "Facebook";
			case "reddit":
				return "Reddit";
			case "twitter":
				return "X";
			case "stackoverflow":
				return "StackOverflow";
			default:
				return key || "Unknown";
		}
	};

	const { platformsAvailable, filteredReports, byCategory, byPlatform, byMonth, categoryPlatformPct } = useMemo(() => {
		const withinRange = (r) => {
			if (!fromDate && !toDate) return true;
			const t = new Date(r.createdAt).getTime();
			if (fromDate) {
				const f = new Date(fromDate).getTime();
				if (t < f) return false;
			}
			if (toDate) {
				const tt = new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1;
				if (t > tt) return false;
			}
			return true;
		};

		const available = new Set();
		const filtered = reports.filter((r) => {
			const raw = r.platform || r?.postData?.type || "";
			const p = normalizePlatform(raw);
			if (p) available.add(p);
			const platformOk = selectedPlatforms.length === 0 || selectedPlatforms.includes(p);
			return platformOk && withinRange(r);
		});

		const cat = {};
		const plat = {};
		const month = {};
		const catPlat = {};
		filtered.forEach((r) => {
			const p = normalizePlatform(r.platform || r?.postData?.type || "unknown");
			plat[p] = (plat[p] || 0) + 1;
			const m = monthKey(r.createdAt);
			month[m] = (month[m] || 0) + 1;
			const types = parseTypes(r.typeOfReport);
			types.forEach((t) => {
				const tUpper = (t || "").toString().replaceAll("_", " ").toUpperCase();
				if (NON_TOXIC_KEYS.includes(tUpper)) return; // skip non toxic buckets
				cat[t] = (cat[t] || 0) + 1;
				if (!catPlat[t]) catPlat[t] = {};
				catPlat[t][p] = (catPlat[t][p] || 0) + 1;
			});
		});

		// Convert catPlat counts to percentages per category
		const catPct = {};
		Object.entries(catPlat).forEach(([catKey, platCounts]) => {
			const total = Object.values(platCounts).reduce((a, b) => a + b, 0) || 1;
			catPct[catKey] = Object.fromEntries(
				Object.entries(platCounts).map(([k, v]) => [k, Math.round((v * 10000) / total) / 100])
			);
		});

		return {
			platformsAvailable: Array.from(available),
			filteredReports: filtered,
			byCategory: cat,
			byPlatform: plat,
			byMonth: month,
			categoryPlatformPct: catPct,
		};
	}, [reports, fromDate, toDate, selectedPlatforms]);

	if (!user || !user.id) {
		return (
			<div className="p-4">
				<div className="bg-gray-100 p-4 rounded-lg">Waiting for user...</div>
			</div>
		);
	}
	if (loading) {
		return (
			<div className="p-4">
				<div className="bg-gray-100 p-4 rounded-lg">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="text-2xl font-bold">Dashboard</div>

			{/* Filters */}
			<div className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-3">
				<div className="font-semibold">Filters</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
					<div className="flex flex-col">
						<label className="text-sm text-gray-600">From</label>
						<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded px-2 py-1" />
					</div>
					<div className="flex flex-col">
						<label className="text-sm text-gray-600">To</label>
						<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded px-2 py-1" />
					</div>
					<div className="flex flex-col">
						<label className="text-sm text-gray-600">Platforms</label>
						<div className="flex flex-wrap gap-2">
							{platformsAvailable.map((p) => (
								<label key={p} className="flex items-center gap-1 text-sm border rounded px-2 py-1 cursor-pointer">
									<input
										type="checkbox"
										checked={selectedPlatforms.includes(p)}
										onChange={(e) => {
											if (e.target.checked) setSelectedPlatforms((prev) => [...prev, p]);
											else setSelectedPlatforms((prev) => prev.filter((x) => x !== p));
										}}
									/>
									<span>{displayPlatform(p)}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			{error && <div className="text-sm text-red-500">{error}</div>}

			<div className="bg-white shadow-md p-4 rounded-lg">
				<div className="font-semibold mb-2">Toxic Reports by Category</div>
				<BarChart data={Object.fromEntries(Object.entries(byCategory).map(([k,v]) => [formatCategoryLabel(k), v]))} barColor="#60a5fa" />
				{/* Platform share per category */}
				<div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
					{Object.keys(byCategory).map((catKey) => (
						<div key={`cat-${catKey}`} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
							<div className="font-semibold mb-1">{formatCategoryLabel(catKey)}</div>
							<div className="flex flex-wrap gap-3">
								{Object.entries(categoryPlatformPct[catKey] || {}).map(([platKey, pct]) => (
									<div key={`${catKey}-${platKey}`}>
										<span className="text-gray-600">{displayPlatform(platKey)}: </span>
										<span className="font-medium">{pct}%</span>
									</div>
								))}
								{!categoryPlatformPct[catKey] && <span className="text-gray-400">No data</span>}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white shadow-md p-4 rounded-lg">
				<div className="font-semibold mb-2">Reports by Platform</div>
				<BarChart data={Object.fromEntries(Object.entries(byPlatform).map(([k,v]) => [displayPlatform(k), v]))} barColor="#34d399" />
			</div>

			<div className="bg-white shadow-md p-4 rounded-lg">
				<div className="font-semibold mb-2">Monthly Reports Trend</div>
				<BarChart data={byMonth} barColor="#f59e0b" />
			</div>
		</div>
	);
}
