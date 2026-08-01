import { describe, it, expect } from 'vitest';
import {
	calculateCaptureStats,
	formatHourLabel,
	formatTimeShort,
	getSortedCaptureDates,
	groupPhotosByComposite,
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
			{ name: '2026-07-31-17-08-26_pibooth.jpg', created: '2026-07-31T17:08:26.000Z', key: 'comp1' },
			{ name: 'pibooth000.jpg', created: '2026-07-31T17:08:25.000Z', key: 'raw0' },
			{ name: 'pibooth001.jpg', created: '2026-07-31T17:08:26.000Z', key: 'raw1' },
			{ name: 'pibooth002.jpg', created: '2026-07-31T17:08:27.000Z', key: 'raw2' },
			{ name: '2026-07-31-18-00-00_pibooth.jpg', created: '2026-07-31T18:00:00.000Z', key: 'comp2' },
			{ name: 'pibooth003.jpg', created: '2026-07-31T18:00:01.000Z', key: 'raw3' }
		];

		const result = groupPhotosByComposite(mockImages);

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
});
