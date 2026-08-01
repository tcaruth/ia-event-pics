import { describe, it, expect } from 'vitest';
import {
	calculateCaptureStats,
	formatHourLabel,
	formatTimeShort,
	getSortedCaptureDates,
	isCompositePhoto
} from './analytics';

describe('analytics.js', () => {
	it('formats hour labels correctly', () => {
		expect(formatHourLabel(0)).toBe('12 AM');
		expect(formatHourLabel(9)).toBe('9 AM');
		expect(formatHourLabel(12)).toBe('12 PM');
		expect(formatHourLabel(15)).toBe('3 PM');
		expect(formatHourLabel(23)).toBe('11 PM');
	});

	it('identifies composite photobooth pictures vs raw frames', () => {
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth.jpg')).toBe(true);
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth.png')).toBe(true);
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth_1.jpg')).toBe(false);
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth_2.jpg')).toBe(false);
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth_raw.jpg')).toBe(false);
		expect(isCompositePhoto('raw_photo.jpg')).toBe(false);
	});

	it('handles empty image arrays gracefully', () => {
		const result = calculateCaptureStats([]);
		expect(result.totalCaptures).toBe(0);
		expect(result.firstCaptureTime).toBeNull();
		expect(result.lastCaptureTime).toBeNull();
		expect(result.activeDurationMinutes).toBe(0);
		expect(result.averageCapturesPerHour).toBe(0);
		expect(result.peakHourLabel).toBe('N/A');
		expect(result.timelineBuckets).toEqual([]);
		expect(result.hourlyDistribution.length).toBe(24);
	});

	it('filters out raw frames and counts only composite captures', () => {
		const mockImages = [
			{ name: '2026-07-31-18-00-00_pibooth.jpg', created: '2026-07-31T18:00:00.000Z' },
			{ name: '2026-07-31-18-00-00_pibooth_1.jpg', created: '2026-07-31T18:00:01.000Z' },
			{ name: '2026-07-31-18-00-00_pibooth_2.jpg', created: '2026-07-31T18:00:02.000Z' },
			{ name: '2026-07-31-18-15-00_pibooth.jpg', created: '2026-07-31T18:15:00.000Z' },
			{ name: '2026-07-31-18-45-00_pibooth.jpg', created: '2026-07-31T18:45:00.000Z' },
			{ name: '2026-07-31-19-15-00_pibooth.jpg', created: '2026-07-31T19:15:00.000Z' }
		];

		const stats = calculateCaptureStats(mockImages, 30);

		// Only 4 composite photos, 2 raw frames
		expect(stats.totalCaptures).toBe(4);
		expect(stats.overlaidCount).toBe(4);
		expect(stats.rawCount).toBe(2);

		expect(stats.firstCaptureTime).toEqual(new Date('2026-07-31T18:00:00.000Z'));
		expect(stats.lastCaptureTime).toEqual(new Date('2026-07-31T19:15:00.000Z'));

		// Sum of timeline buckets should match composite total (4)
		const bucketSum = stats.timelineBuckets.reduce((acc, b) => acc + b.count, 0);
		expect(bucketSum).toBe(4);
	});

	it('correctly marks peak timeline buckets', () => {
		const mockImages = [
			{ name: '2026-07-31-20-01-00_pibooth.jpg', created: '2026-07-31T20:01:00.000Z' },
			{ name: '2026-07-31-20-05-00_pibooth.jpg', created: '2026-07-31T20:05:00.000Z' },
			{ name: '2026-07-31-20-10-00_pibooth.jpg', created: '2026-07-31T20:10:00.000Z' },
			{ name: '2026-07-31-20-35-00_pibooth.jpg', created: '2026-07-31T20:35:00.000Z' }
		];

		const stats = calculateCaptureStats(mockImages, 30);
		const peakBuckets = stats.timelineBuckets.filter((b) => b.isPeak);

		expect(peakBuckets.length).toBe(1);
		expect(peakBuckets[0].count).toBe(3);
	});
});
