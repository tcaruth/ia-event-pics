import { onNavigate } from '$app/navigation';
import { activeTransitionPhoto } from '$lib/stores.js';

export const preparePageTransition = () => {
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.to?.url.href === navigation.from?.url.href) return;

		// Extract target photo filename if navigating to or from an image viewer page
		const toFilename = navigation.to?.params?.filename;
		const fromFilename = navigation.from?.params?.filename;
		const targetPhoto = toFilename || fromFilename;

		if (targetPhoto) {
			activeTransitionPhoto.set(targetPhoto);
		}

		return new Promise((oldStateCaptureResolve) => {
			document.startViewTransition(async () => {
				oldStateCaptureResolve();
				try {
					await navigation.complete;
				} finally {
					activeTransitionPhoto.set(null);
				}
			});
		});
	});
};