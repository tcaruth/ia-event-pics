import { describe, it, expect } from 'vitest';
import {
	calculateCaptureStats,
	formatHourLabel,
	formatTimeShort,
	getSortedCaptureDates
} from './analytics';

describe('analytics.js', () => {
	it('formats hour labels correctly', () => {
		expect(formatHourLabel(0)).toBe('12 AM');
		expect(formatHourLabel(9)).toBe('9 AM');
		expect(formatHourLabel(12)).toBe('12 PM');
		expect(formatHourLabel(15)).toBe('3 PM');
		expect(formatHourLabel(23)).toBe('11 PM');
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

	it('correctly calculates stats for mock captures', () => {
		const mockImages = [
			{ name: 'pibooth_01.jpg', created: '2026-07-31T18:00:00.000Z' },
			{ name: 'pibooth_01_raw.jpg', created: '2026-07-31T18:05:00.000Z' },
			{ name: 'pibooth_02.jpg', created: '2026-07-31T18:15:00.000Z' },
			{ name: 'pibooth_03.jpg', created: '2026-07-31T18:45:00.000Z' },
			{ name: 'pibooth_04.jpg', created: '2026-07-31T19:15:00.000Z' }
		];

		const stats = calculateCaptureStats(mockImages, 30);

		expect(stats.totalCaptures).toBe(5);
		expect(stats.rawCount).toBe(1);
		expect(stats.overlaidCount).toBe(4);

		expect(stats.firstCaptureTime).toEqual(new Date('2026-07-31T18:00:00.000Z'));
		expect(stats.lastCaptureTime).toEqual(new Date('2026-07-31T19:15:00.000Z'));
		expect(stats.activeDurationMinutes).toBe(75);

		// Peak hour: hour 18 (6 PM UTC) has 4 captures
		const peakHour = new Date('2026-07-31T18:00:00.000Z').getHours();
		expect(stats.peakHourCount).toBe(4);
		expect(stats.peakHourLabel).toBe(formatHourLabel(peakHour));

		// Buckets for 30m intervals
		expect(stats.timelineBuckets.length).toBeGreaterThan(0);
		// Check sum of counts in timeline buckets equals total captures
		const bucketSum = stats.timelineBuckets.reduce((acc, b) => acc + b.count, 0);
		expect(bucketSum).toBe(5);
	});

	it('correctly marks peak timeline buckets', () => {
		const mockImages = [
			{ created: '2026-07-31T20:01:00.000Z' },
			{ created: '2026-07-31T20:05:00.000Z' },
			{ created: '2026-07-31T20:10:00.000Z' },
			{ created: '2026-07-31T20:35:00.000Z' }
		];

		const stats = calculateCaptureStats(mockImages, 30);
		const peakBuckets = stats.timelineBuckets.filter((b) => b.isPeak);

		expect(peakBuckets.length).toBe(1);
		expect(peakBuckets[0].count).toBe(3);
	});
});
