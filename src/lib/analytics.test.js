import { describe, it, expect } from 'vitest';
import {
	calculateCaptureStats,
	filterOutlierPhotos,
	formatHourLabel,
	formatTimeShort,
	getSortedCaptureDates,
	groupPhotosByComposite,
	isCompositePhoto,
	getLastPhotoTimestamp,
	isEventEnded
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

		// Raw frame formats
		expect(isCompositePhoto('pibooth000.jpg')).toBe(false);
		expect(isCompositePhoto('pibooth001.jpg')).toBe(false);
		expect(isCompositePhoto('pibooth002.jpg')).toBe(false);

		// Other raw formats
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth_1.jpg')).toBe(false);
		expect(isCompositePhoto('2026-07-31-17-08-26_pibooth_raw.jpg')).toBe(false);
	});

	it('groups raw photos under matching composite photo', () => {
		const mockImages = [
			{
				name: '2026-07-31-17-08-26_pibooth.jpg',
				created: '2026-07-31T17:08:26.000Z',
				key: 'comp1'
			},
			{ name: 'pibooth000.jpg', created: '2026-07-31T17:08:20.000Z', key: 'raw0' },
			{ name: 'pibooth001.jpg', created: '2026-07-31T17:08:22.000Z', key: 'raw1' },
			{ name: 'pibooth002.jpg', created: '2026-07-31T17:08:24.000Z', key: 'raw2' },
			{
				name: '2026-07-31-18-00-00_pibooth.jpg',
				created: '2026-07-31T18:00:00.000Z',
				key: 'comp2'
			},
			{ name: 'pibooth003.jpg', created: '2026-07-31T17:59:55.000Z', key: 'raw3' }
		];

		const result = groupPhotosByComposite(mockImages, [1, 4]);

		expect(result.groups.length).toBe(2);

		// Group 1 (comp1)
		const group1 = result.groups[0];
		expect(group1.composite.key).toBe('comp1');
		expect(group1.rawPhotos.length).toBe(3);
		expect(group1.rawPhotos.map((r) => r.key)).toEqual(['raw0', 'raw1', 'raw2']);

		// Group 2 (comp2)
		const group2 = result.groups[1];
		expect(group2.composite.key).toBe('comp2');
		expect(group2.rawPhotos.length).toBe(1);
		expect(group2.rawPhotos[0].key).toBe('raw3');

		expect(result.standaloneRaws).toEqual([]);
	});

	it('prevents merging raw photos from back-to-back composite sessions', () => {
		const mockImages = [
			// Session A (composite @ 17:08:26)
			{ name: 'pibooth000.jpg', created: '2026-07-31T17:08:10.000Z', key: 's1_r0' },
			{ name: 'pibooth001.jpg', created: '2026-07-31T17:08:15.000Z', key: 's1_r1' },
			{ name: 'pibooth002.jpg', created: '2026-07-31T17:08:20.000Z', key: 's1_r2' },
			{ name: 'pibooth003.jpg', created: '2026-07-31T17:08:25.000Z', key: 's1_r3' },
			{
				name: '2026-07-31-17-08-26_pibooth.jpg',
				created: '2026-07-31T17:08:26.000Z',
				key: 's1_comp'
			},

			// Session B taken immediately back-to-back (composite @ 17:09:02)
			{ name: 'pibooth000.jpg', created: '2026-07-31T17:08:45.000Z', key: 's2_r0' },
			{ name: 'pibooth001.jpg', created: '2026-07-31T17:08:50.000Z', key: 's2_r1' },
			{ name: 'pibooth002.jpg', created: '2026-07-31T17:08:55.000Z', key: 's2_r2' },
			{ name: 'pibooth003.jpg', created: '2026-07-31T17:09:00.000Z', key: 's2_r3' },
			{
				name: '2026-07-31-17-09-02_pibooth.jpg',
				created: '2026-07-31T17:09:02.000Z',
				key: 's2_comp'
			}
		];

		const result = groupPhotosByComposite(mockImages, [1, 4]);

		expect(result.groups.length).toBe(2);

		// Session A group
		const groupA = result.groups[0];
		expect(groupA.composite.key).toBe('s1_comp');
		expect(groupA.rawPhotos.length).toBe(4);
		expect(groupA.rawPhotos.map((r) => r.key)).toEqual(['s1_r0', 's1_r1', 's1_r2', 's1_r3']);

		// Session B group
		const groupB = result.groups[1];
		expect(groupB.composite.key).toBe('s2_comp');
		expect(groupB.rawPhotos.length).toBe(4);
		expect(groupB.rawPhotos.map((r) => r.key)).toEqual(['s2_r0', 's2_r1', 's2_r2', 's2_r3']);
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
		expect(result.outliersExcludedCount).toBe(0);
	});

	describe('filterOutlierPhotos', () => {
		it('returns empty array when passed empty or non-array inputs', () => {
			expect(filterOutlierPhotos([])).toEqual([]);
			expect(filterOutlierPhotos(null)).toEqual([]);
			expect(filterOutlierPhotos(undefined)).toEqual([]);
		});

		it('returns all photos when all photos are within the 4-hour threshold', () => {
			const images = [
				{ name: '2026-09-12-20-00-00_pibooth.jpg', created: '2026-09-12T20:00:00.000Z' },
				{ name: 'pibooth000.jpg', created: '2026-09-12T20:00:05.000Z' },
				{ name: '2026-09-12-21-30-00_pibooth.jpg', created: '2026-09-12T21:30:00.000Z' },
				{ name: '2026-09-12-23-00-00_pibooth.jpg', created: '2026-09-12T23:00:00.000Z' }
			];

			const filtered = filterOutlierPhotos(images, 4);
			expect(filtered.length).toBe(4);
		});

		it('excludes test photos taken on Friday when the actual event is on Saturday', () => {
			const images = [
				// Friday test setup (26+ hours prior to event)
				{ name: '2026-09-11-17-16-18_pibooth.jpg', created: '2026-09-11T22:16:18.000Z' },
				{ name: 'pibooth000.jpg', created: '2026-09-11T22:16:15.000Z' },
				{ name: '2026-09-11-17-18-37_pibooth.jpg', created: '2026-09-11T22:18:37.000Z' },
				{ name: '2026-09-11-17-20-23_pibooth.jpg', created: '2026-09-11T22:20:23.000Z' },

				// Saturday event photos
				{ name: '2026-09-12-20-00-01_pibooth.jpg', created: '2026-09-13T01:00:01.000Z' },
				{ name: 'pibooth000.jpg', created: '2026-09-13T01:00:00.000Z' },
				{ name: '2026-09-12-21-15-00_pibooth.jpg', created: '2026-09-13T02:15:00.000Z' },
				{ name: '2026-09-12-22-30-00_pibooth.jpg', created: '2026-09-13T03:30:00.000Z' },
				{ name: '2026-09-12-23-45-00_pibooth.jpg', created: '2026-09-13T04:45:00.000Z' }
			];

			const filtered = filterOutlierPhotos(images, 4);

			// Should only contain the 5 Saturday photos
			expect(filtered.length).toBe(5);
			expect(filtered.every((img) => img.created.startsWith('2026-09-13'))).toBe(true);
		});

		it('excludes teardown test photos taken more than 4 hours after the event', () => {
			const images = [
				// Event captures
				{ name: '2026-09-12-19-00-00_pibooth.jpg', created: '2026-09-12T19:00:00.000Z' },
				{ name: '2026-09-12-20-00-00_pibooth.jpg', created: '2026-09-12T20:00:00.000Z' },
				{ name: '2026-09-12-22-00-00_pibooth.jpg', created: '2026-09-12T22:00:00.000Z' },

				// Sunday morning teardown (10 hours later)
				{ name: '2026-09-13-08-00-00_pibooth.jpg', created: '2026-09-13T08:00:00.000Z' }
			];

			const filtered = filterOutlierPhotos(images, 4);

			expect(filtered.length).toBe(3);
			expect(filtered.some((img) => img.name.startsWith('2026-09-13'))).toBe(false);
		});

		it('preserves sessions with natural gaps under 4 hours (e.g. 2.5 hour dinner)', () => {
			const images = [
				{ name: '2026-09-12-17-00-00_pibooth.jpg', created: '2026-09-12T17:00:00.000Z' },
				// 2.5 hour gap (dinner/speeches)
				{ name: '2026-09-12-19-30-00_pibooth.jpg', created: '2026-09-12T19:30:00.000Z' },
				{ name: '2026-09-12-21-00-00_pibooth.jpg', created: '2026-09-12T21:00:00.000Z' }
			];

			const filtered = filterOutlierPhotos(images, 4);
			expect(filtered.length).toBe(3);
		});
	});

	describe('calculateCaptureStats with outlier filtering', () => {
		it('calculates accurate duration and capture rate by ignoring Friday test captures', () => {
			const images = [
				// Friday test setup (3 composites)
				{ name: '2026-09-11-17-16-18_pibooth.jpg', created: '2026-09-11T22:16:18.000Z' },
				{ name: '2026-09-11-17-18-37_pibooth.jpg', created: '2026-09-11T22:18:37.000Z' },
				{ name: '2026-09-11-17-20-23_pibooth.jpg', created: '2026-09-11T22:20:23.000Z' },
				// Raw photo for Friday
				{ name: 'pibooth000.jpg', created: '2026-09-11T22:16:15.000Z' },

				// Saturday event: 8:00 PM to 10:00 PM (2 hours = 120 mins)
				{ name: '2026-09-12-20-00-00_pibooth.jpg', created: '2026-09-13T01:00:00.000Z' },
				{ name: '2026-09-12-20-30-00_pibooth.jpg', created: '2026-09-13T01:30:00.000Z' },
				{ name: '2026-09-12-21-00-00_pibooth.jpg', created: '2026-09-13T02:00:00.000Z' },
				{ name: '2026-09-12-21-30-00_pibooth.jpg', created: '2026-09-13T02:30:00.000Z' },
				{ name: '2026-09-12-22-00-00_pibooth.jpg', created: '2026-09-13T03:00:00.000Z' },
				// Raw photo for Saturday
				{ name: 'pibooth000.jpg', created: '2026-09-13T01:00:05.000Z' }
			];

			const stats = calculateCaptureStats(images, 15);

			// Friday's 3 composites + 1 raw = 4 photos excluded
			expect(stats.outliersExcludedCount).toBe(4);
			expect(stats.totalCaptures).toBe(5);
			expect(stats.overlaidCount).toBe(5);
			expect(stats.rawCount).toBe(1);

			// Active duration should be 120 mins (2 hours), NOT 28+ hours!
			expect(stats.activeDurationMinutes).toBe(120);
			expect(stats.firstCaptureTime).toEqual(new Date('2026-09-13T01:00:00.000Z'));
			expect(stats.lastCaptureTime).toEqual(new Date('2026-09-13T03:00:00.000Z'));

			// Average capture rate: 5 captures / 2 hours = 2.5/hr
			expect(stats.averageCapturesPerHour).toBe(2.5);

			// Timeline buckets should span only the 2-hour event, not 28+ hours of empty buckets
			expect(stats.timelineBuckets.length).toBe(9);
		});
	});

	describe('getLastPhotoTimestamp', () => {
		it('returns null for empty or non-array inputs', () => {
			expect(getLastPhotoTimestamp([])).toBeNull();
			expect(getLastPhotoTimestamp(null)).toBeNull();
			expect(getLastPhotoTimestamp(undefined)).toBeNull();
		});

		it('returns newest timestamp from image created properties', () => {
			const images = [
				{ created: '2026-08-01T10:00:00.000Z' },
				{ created: '2026-08-01T14:30:00.000Z' },
				{ created: '2026-08-01T12:00:00.000Z' }
			];
			expect(getLastPhotoTimestamp(images)).toBe(new Date('2026-08-01T14:30:00.000Z').getTime());
		});

		it('extracts timestamp from filename when created is missing', () => {
			const images = [
				{ name: '2026-08-01-10-00-00_pibooth.jpg' },
				{ name: '2026-08-01-18-45-00_pibooth.jpg' }
			];
			expect(getLastPhotoTimestamp(images)).toBe(new Date('2026-08-01T18:45:00').getTime());
		});
	});

	describe('isEventEnded', () => {
		it('returns false for empty image array', () => {
			expect(isEventEnded([])).toBe(false);
		});

		it('returns false when last photo is within 24 hours', () => {
			const now = new Date('2026-08-02T12:00:00.000Z').getTime();
			const images = [
				{ created: '2026-08-01T14:00:00.000Z' }, // 22 hours ago
				{ created: '2026-08-01T15:00:00.000Z' } // 21 hours ago
			];
			expect(isEventEnded(images, now)).toBe(false);
		});

		it('returns true when more than 24 hours have passed since last photo', () => {
			const now = new Date('2026-08-02T20:00:00.000Z').getTime();
			const images = [
				{ created: '2026-08-01T12:00:00.000Z' }, // 32 hours ago
				{ created: '2026-08-01T15:00:00.000Z' } // 29 hours ago
			];
			expect(isEventEnded(images, now)).toBe(true);
		});
	});
});
