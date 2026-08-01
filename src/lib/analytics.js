/**
 * @typedef {Object} TimelineBucket
 * @property {string} label
 * @property {Date} startTime
 * @property {Date} endTime
 * @property {number} count
 * @property {boolean} isPeak
 */

/**
 * @typedef {Object} HourlyDistribution
 * @property {number} hour
 * @property {string} label
 * @property {number} count
 */

/**
 * @typedef {Object} CaptureStats
 * @property {number} totalCaptures
 * @property {Date | null} firstCaptureTime
 * @property {Date | null} lastCaptureTime
 * @property {number} activeDurationMinutes
 * @property {number} averageCapturesPerHour
 * @property {number} overlaidCount
 * @property {number} rawCount
 * @property {string} peakHourLabel
 * @property {number} peakHourCount
 * @property {HourlyDistribution[]} hourlyDistribution
 * @property {TimelineBucket[]} timelineBuckets
 */

/**
 * Formats a Date object to a short time string (e.g., "7:30 PM")
 * @param {Date} date
 * @returns {string}
 */
export function formatTimeShort(date) {
	if (!date || isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(date);
}

/**
 * Formats hour index (0-23) to hour string (e.g. "7 PM")
 * @param {number} hour
 * @returns {string}
 */
export function formatHourLabel(hour) {
	const period = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${displayHour} ${period}`;
}

/**
 * Determines whether a file represents a composite photobooth capture (and not a raw frame/individual shot).
 * Composite format example: 2026-07-31-17-08-26_pibooth.jpg
 * Raw format examples: pibooth000.jpg, pibooth001.jpg, pibooth_1.jpg, pibooth_raw.jpg
 * @param {string} [name]
 * @returns {boolean}
 */
export function isCompositePhoto(name) {
	if (!name || typeof name !== 'string') return true;
	const lower = name.toLowerCase();

	// Exclude explicit raw indicators
	if (lower.includes('raw')) return false;

	// Exclude raw frame patterns e.g. pibooth000.jpg, pibooth001.jpg, pibooth12.png
	if (/pibooth\d+\.(jpg|jpeg|png|webp)$/i.test(lower)) return false;

	// Exclude numbered frames after _pibooth like _pibooth_1.jpg, _pibooth_001.jpg
	if (/_pibooth_\d+/i.test(lower)) return false;

	// If the name contains pibooth, ensure it ends with _pibooth.<ext> (preceded by timestamp)
	if (lower.includes('pibooth')) {
		return /_pibooth\.(jpg|jpeg|png|webp)$/i.test(lower);
	}

	return true;
}

/**
 * Groups raw capture frames under their parent composite photobooth picture.
 * Uses sequential session boundaries and Sanity event capture settings for precision grouping.
 *
 * @param {Array<any>} images
 * @param {number[]} [eventCaptures] Optional capture count options from Sanity event configuration (e.g. [1, 4])
 * @returns {{ groups: Array<{ composite: any, rawPhotos: any[] }>, standaloneRaws: any[] }}
 */
export function groupPhotosByComposite(images = [], eventCaptures = []) {
	if (!Array.isArray(images) || images.length === 0) {
		return { groups: [], standaloneRaws: [] };
	}

	// 1. Separate composites and raws, sorted chronologically by creation timestamp
	const getTimestamp = (img) => (img?.created ? new Date(img.created).getTime() : 0);

	const composites = images
		.filter((img) => isCompositePhoto(img?.name))
		.sort((a, b) => getTimestamp(a) - getTimestamp(b));

	const raws = images
		.filter((img) => !isCompositePhoto(img?.name))
		.sort((a, b) => getTimestamp(a) - getTimestamp(b));

	const assignedRawKeys = new Set();
	const getIdentifier = (raw) => raw.key || raw.id || raw.url || raw.fullPath;

	// Helper to extract YYYY-MM-DD-HH-MM-SS or date pattern from filename
	const getDateKey = (filename = '') => {
		const match = filename.match(/\d{4}-\d{2}-\d{2}[-_]\d{2}[-_]\d{2}[-_]\d{2}/);
		return match ? match[0].replace(/[_]/g, '-') : null;
	};

	const compositeRawMap = new Map();
	for (const comp of composites) {
		compositeRawMap.set(comp, []);
	}

	// Pass 1: Direct Filename Date Key Matching (e.g. 2026-07-31-17-08-26_pibooth_1.jpg matching 2026-07-31-17-08-26_pibooth.jpg)
	for (const comp of composites) {
		const compDateKey = getDateKey(comp.name);
		if (!compDateKey) continue;

		for (const raw of raws) {
			const id = getIdentifier(raw);
			if (assignedRawKeys.has(id)) continue;

			const rawDateKey = getDateKey(raw.name);
			if (rawDateKey && rawDateKey === compDateKey) {
				assignedRawKeys.add(id);
				compositeRawMap.get(comp).push(raw);
			}
		}
	}

	// Pass 2: Sequential Time-Session Window Matching
	// Photobooth takes raw photos sequentially, THEN generates the composite photo at the end of the session.
	// So raw photos for composite C[i] occur between C[i-1].created and C[i].created (+ buffer).
	for (let i = 0; i < composites.length; i++) {
		const comp = composites[i];
		const compTime = getTimestamp(comp);
		const prevCompTime = i > 0 ? getTimestamp(composites[i - 1]) : 0;

		// Session window: strictly after previous composite, up to current composite (+ 5s upload latency buffer)
		const candidateRaws = raws.filter((raw) => {
			const id = getIdentifier(raw);
			if (assignedRawKeys.has(id)) return false;

			const rawTime = getTimestamp(raw);
			if (!rawTime) return false;

			// Must be after previous composite (minus 2s overlap buffer)
			const isAfterPrev = prevCompTime === 0 || rawTime >= prevCompTime - 2000;
			// Must be before or slightly at current composite time (+ 5000ms buffer)
			const isBeforeComp = rawTime <= compTime + 5000;

			return isAfterPrev && isBeforeComp;
		});

		// Determine maximum expected captures if specified in eventCaptures
		let maxAllowed = Infinity;
		if (Array.isArray(eventCaptures) && eventCaptures.length > 0) {
			const maxConfigured = Math.max(...eventCaptures);
			if (maxConfigured > 0) {
				maxAllowed = maxConfigured;
			}
		}

		// Take candidate raws up to maxAllowed limit (prioritizing those closest to current composite)
		const selectedRaws = candidateRaws.slice(-maxAllowed);
		for (const raw of selectedRaws) {
			assignedRawKeys.add(getIdentifier(raw));
			compositeRawMap.get(comp).push(raw);
		}
	}

	// Build final groups
	const groups = composites.map((composite) => {
		const rawPhotos = compositeRawMap.get(composite) || [];
		// Sort raw photos in filename sequence order e.g. pibooth000.jpg, pibooth001.jpg
		rawPhotos.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

		return {
			composite,
			rawPhotos
		};
	});

	// Any unassigned raw photos become standalone raws
	const standaloneRaws = raws.filter((raw) => !assignedRawKeys.has(getIdentifier(raw)));

	return {
		groups,
		standaloneRaws
	};
}

/**
 * Parses image list into valid sorted dates
 * @param {Array<{ created?: string }>} images
 * @returns {Date[]}
 */
export function getSortedCaptureDates(images) {
	if (!Array.isArray(images)) return [];
	return images
		.map((img) => (img?.created ? new Date(img.created) : null))
		.filter((date) => date && !isNaN(date.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Calculates capture statistics and histogram time buckets from an array of images,
 * strictly counting composite photobooth captures (e.g., 2026-07-31-17-08-26_pibooth.jpg).
 * @param {Array<{ created?: string, name?: string }>} images
 * @param {number} [intervalMinutes=30]
 * @returns {CaptureStats}
 */
export function calculateCaptureStats(images = [], intervalMinutes = 30) {
	const emptyResult = {
		totalCaptures: 0,
		firstCaptureTime: null,
		lastCaptureTime: null,
		activeDurationMinutes: 0,
		averageCapturesPerHour: 0,
		overlaidCount: 0,
		rawCount: 0,
		peakHourLabel: 'N/A',
		peakHourCount: 0,
		hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
			hour: i,
			label: formatHourLabel(i),
			count: 0
		})),
		timelineBuckets: []
	};

	if (!Array.isArray(images) || images.length === 0) {
		return emptyResult;
	}

	// Filter strictly for composite photos
	const compositeImages = images.filter((img) => isCompositePhoto(img?.name));
	const rawCount = images.length - compositeImages.length;
	const overlaidCount = compositeImages.length;

	if (compositeImages.length === 0) {
		return {
			...emptyResult,
			rawCount
		};
	}

	const dates = getSortedCaptureDates(compositeImages);
	if (dates.length === 0) {
		return {
			...emptyResult,
			rawCount
		};
	}

	const totalCaptures = compositeImages.length;
	const firstCaptureTime = dates[0];
	const lastCaptureTime = dates[dates.length - 1];

	const activeDurationMs = lastCaptureTime.getTime() - firstCaptureTime.getTime();
	const activeDurationMinutes = Math.max(1, Math.round(activeDurationMs / (1000 * 60)));

	// Average captures per hour during active duration
	const durationHours = Math.max(activeDurationMinutes / 60, 1 / 60);
	const averageCapturesPerHour = Number((totalCaptures / durationHours).toFixed(1));

	// 24-hour distribution calculation
	const hourlyCounts = Array(24).fill(0);
	for (const d of dates) {
		hourlyCounts[d.getHours()]++;
	}

	let peakHourIdx = 0;
	let maxHourlyCount = 0;
	for (let h = 0; h < 24; h++) {
		if (hourlyCounts[h] > maxHourlyCount) {
			maxHourlyCount = hourlyCounts[h];
			peakHourIdx = h;
		}
	}

	const hourlyDistribution = hourlyCounts.map((count, hour) => ({
		hour,
		label: formatHourLabel(hour),
		count
	}));

	const peakHourLabel = maxHourlyCount > 0 ? formatHourLabel(peakHourIdx) : 'N/A';

	// Timeline Buckets Generation
	const safeInterval = Math.max(5, intervalMinutes);
	const intervalMs = safeInterval * 60 * 1000;

	// Align start time to floor interval
	const startMs = Math.floor(firstCaptureTime.getTime() / intervalMs) * intervalMs;
	const endMs = Math.ceil((lastCaptureTime.getTime() + 1) / intervalMs) * intervalMs;

	const timelineBuckets = [];
	let maxBucketCount = 0;

	let currentMs = startMs;
	while (currentMs < endMs) {
		const bucketStart = new Date(currentMs);
		const bucketEnd = new Date(currentMs + intervalMs);

		// Count captures falling in [bucketStart, bucketEnd)
		const count = dates.filter(
			(d) => d.getTime() >= currentMs && d.getTime() < currentMs + intervalMs
		).length;

		if (count > maxBucketCount) {
			maxBucketCount = count;
		}

		timelineBuckets.push({
			label: formatTimeShort(bucketStart),
			startTime: bucketStart,
			endTime: bucketEnd,
			count,
			isPeak: false
		});

		currentMs += intervalMs;
	}

	// Mark peak buckets
	if (maxBucketCount > 0) {
		for (const bucket of timelineBuckets) {
			if (bucket.count === maxBucketCount) {
				bucket.isPeak = true;
			}
		}
	}

	return {
		totalCaptures,
		firstCaptureTime,
		lastCaptureTime,
		activeDurationMinutes,
		averageCapturesPerHour,
		overlaidCount,
		rawCount,
		peakHourLabel,
		peakHourCount: maxHourlyCount,
		hourlyDistribution,
		timelineBuckets
	};
}
