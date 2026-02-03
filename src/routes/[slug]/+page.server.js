export async function load({ params, parent }) {
	console.log('Page load function called for slug:', params.slug);
	const { event } = await parent();

	return {
		images: event?.images || [],
		event: event,
		slug: params.slug
	};
}
