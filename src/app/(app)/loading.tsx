/* Loading Component
 * Special Next.js file shown during route transitions.
 * Returns null so server-streamed page content renders without a flashing
 * full-page loader; this prevents non-JS clients from seeing only "Loader..."
 * before hydration completes.
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui
 */
export default function LoadingComponent() {
	return null;
}
