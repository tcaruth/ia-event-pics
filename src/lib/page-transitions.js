import { onNavigate } from '$app/navigation';

export const preparePageTransition = () => {
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.to?.url.href === navigation.from?.url.href) return;

		return new Promise((oldStateCaptureResolve) => {
			document.startViewTransition(async () => {
				oldStateCaptureResolve();
				await navigation.complete;
			});
		});
	});
};