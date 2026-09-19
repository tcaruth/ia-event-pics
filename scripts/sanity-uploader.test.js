import { describe, it, expect } from 'vitest';
import tinycolor from 'tinycolor2';
import ini from 'ini';

function hexToRgbTuple(hex) {
	const rgb = tinycolor(hex).toRgb();
	return `(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function buildPiboothConfig(baseConfigObject, event) {
	const config = { ...baseConfigObject };
	if (!config.WINDOW) config.WINDOW = {};
	if (!config.PICTURE) config.PICTURE = {};
	if (!config.QRCODE) config.QRCODE = {};

	if (event.colors) {
		if (event.colors.surfaceText) {
			config.WINDOW.text_color = hexToRgbTuple(event.colors.surfaceText);
		}
		if (event.colors.surface) {
			config.WINDOW.background = hexToRgbTuple(event.colors.surface);
		}
	}

	if (event.captures) {
		config.PICTURE.captures = `(${event.captures.join(',')})`;
	}

	if (event.slug?.current) {
		config.QRCODE.prefix_url = `https://iaevent.pics/${event.slug.current}/{picture}`;
	}

	return config;
}

describe('Sanity Uploader Daemon Utilities', () => {
	describe('hexToRgbTuple', () => {
		it('converts hex colors to pibooth RGB tuple strings', () => {
			expect(hexToRgbTuple('#ff0000')).toBe('(255, 0, 0)');
			expect(hexToRgbTuple('#00ff00')).toBe('(0, 255, 0)');
			expect(hexToRgbTuple('#663399')).toBe('(102, 51, 153)');
		});
	});

	describe('buildPiboothConfig', () => {
		it('maps Sanity event metadata to Pibooth INI configuration format', () => {
			const event = {
				slug: { current: 'demo-wedding' },
				colors: {
					surfaceText: '#ffffff',
					surface: '#111827'
				},
				captures: [1, 4]
			};

			const config = buildPiboothConfig({}, event);

			expect(config.WINDOW.text_color).toBe('(255, 255, 255)');
			expect(config.WINDOW.background).toBe('(17, 24, 39)');
			expect(config.PICTURE.captures).toBe('(1,4)');
			expect(config.QRCODE.prefix_url).toBe('https://iaevent.pics/demo-wedding/{picture}');

			const iniString = ini.stringify(config);
			expect(iniString).toContain('text_color=(255, 255, 255)');
			expect(iniString).toContain('prefix_url=https://iaevent.pics/demo-wedding/{picture}');
		});
	});
});
