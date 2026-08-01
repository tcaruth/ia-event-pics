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
 * Calculates capture statistics and histogram time buckets from an array of images.
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

	const dates = getSortedCaptureDates(images);
	if (dates.length === 0) {
		return emptyResult;
	}

	const totalCaptures = images.length;
	const firstCaptureTime = dates[0];
	const lastCaptureTime = dates[dates.length - 1];

	const activeDurationMs = lastCaptureTime.getTime() - firstCaptureTime.getTime();
	const activeDurationMinutes = Math.max(1, Math.round(activeDurationMs / (1000 * 60)));

	// Average captures per hour during active duration
	const durationHours = Math.max(activeDurationMinutes / 60, 1 / 60);
	const averageCapturesPerHour = Number((totalCaptures / durationHours).toFixed(1));

	// Photo classification (raw vs overlaid)
	let rawCount = 0;
	let overlaidCount = 0;
	for (const img of images) {
		const name = (img?.name || '').toLowerCase();
		if (name.includes('raw')) {
			rawCount++;
		} else {
			overlaidCount++;
		}
	}

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
