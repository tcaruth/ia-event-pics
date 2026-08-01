<script>
	import { calculateCaptureStats, formatTimeShort } from './analytics';

	/** @type {{ images?: Array<{ created?: string, name?: string }> }} */
	let { images = [] } = $props();

	let selectedInterval = $state(15);

	/** @type {import('./analytics').TimelineBucket | null} */
	let hoveredBucket = $state(null);

	let stats = $derived(calculateCaptureStats(images, selectedInterval));

	let maxBucketCount = $derived(
		stats.timelineBuckets.reduce((max, b) => Math.max(max, b.count), 0) || 1
	);

	let maxHourlyCount = $derived(
		stats.hourlyDistribution.reduce((max, h) => Math.max(max, h.count), 0) || 1
	);
</script>

<div class="analytics-card">
	<div class="analytics-header">
		<div class="header-info">
			<h2>Capture Analytics</h2>
			<p class="subtitle">Activity distribution & performance over time (15-min intervals)</p>
		</div>
	</div>

	{#if images.length === 0}
		<div class="empty-analytics">
			<span class="empty-icon">📊</span>
			<p>No capture data recorded yet for this event.</p>
		</div>
	{:else}
		<div class="stats-grid">
			<div class="kpi-card">
				<span class="kpi-label">Total Captures</span>
				<span class="kpi-value">{stats.totalCaptures}</span>
				<span class="kpi-sub">
					{stats.overlaidCount} overlaid, {stats.rawCount} raw
				</span>
			</div>

			<div class="kpi-card">
				<span class="kpi-label">Capture Rate</span>
				<span class="kpi-value">{stats.averageCapturesPerHour} <span class="unit">/hr</span></span>
				<span class="kpi-sub">
					Active over {stats.activeDurationMinutes} mins
				</span>
			</div>

			<div class="kpi-card">
				<span class="kpi-label">Peak Hour</span>
				<span class="kpi-value">{stats.peakHourLabel}</span>
				<span class="kpi-sub">
					{stats.peakHourCount} captures during peak
				</span>
			</div>

			<div class="kpi-card">
				<span class="kpi-label">Active Timeframe</span>
				<span class="kpi-value small">
					{stats.firstCaptureTime ? formatTimeShort(stats.firstCaptureTime) : 'N/A'} - 
					{stats.lastCaptureTime ? formatTimeShort(stats.lastCaptureTime) : 'N/A'}
				</span>
				<span class="kpi-sub">First to last capture</span>
			</div>
		</div>

		<!-- Timeline Bar Chart -->
		<div class="chart-section">
			<div class="chart-header">
				<h3>Captures Over Time</h3>
				{#if hoveredBucket}
					<div class="hover-tooltip">
						<span class="tooltip-time">{hoveredBucket.label}</span>
						<span class="tooltip-count">{hoveredBucket.count} photo{hoveredBucket.count === 1 ? '' : 's'}</span>
						{#if hoveredBucket.isPeak}
							<span class="peak-badge">Peak</span>
						{/if}
					</div>
				{/if}
			</div>

			<div class="histogram-container">
				<div class="histogram-bars">
					{#each stats.timelineBuckets as bucket}
						{@const heightPercent = Math.max((bucket.count / maxBucketCount) * 100, bucket.count > 0 ? 8 : 2)}
						<div
							class="bar-wrapper"
							role="group"
							aria-label="Capture bucket for {bucket.label}"
							onmouseenter={() => (hoveredBucket = bucket)}
							onmouseleave={() => (hoveredBucket = null)}
						>
							<div
								class="bar"
								class:has-captures={bucket.count > 0}
								class:is-peak={bucket.isPeak}
								style="height: {heightPercent}%;"
							>
								{#if bucket.count > 0}
									<span class="bar-count">{bucket.count}</span>
								{/if}
							</div>
							<span class="bar-label">{bucket.label}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- 24-Hour Distribution Section -->
		<div class="hourly-section">
			<h3>24-Hour Activity Profile</h3>
			<div class="hourly-grid">
				{#each stats.hourlyDistribution as hourSlot}
					{@const heightPercent = Math.max((hourSlot.count / maxHourlyCount) * 100, hourSlot.count > 0 ? 12 : 3)}
					{@const isPeakHour = hourSlot.count > 0 && hourSlot.count === stats.peakHourCount}
					<div
						class="hourly-col"
						title="{hourSlot.label}: {hourSlot.count} capture{hourSlot.count === 1 ? '' : 's'}"
					>
						<div
							class="hourly-bar"
							class:active={hourSlot.count > 0}
							class:peak={isPeakHour}
							style="height: {heightPercent}%;"
						></div>
						{#if hourSlot.hour % 3 === 0}
							<span class="hourly-label">{hourSlot.label}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.analytics-card {
		background: var(--surface-secondary, #1a1e29);
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: var(--shadow-sm);
	}

	.analytics-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.header-info h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary, #ffffff);
	}

	.subtitle {
		font-size: 0.875rem;
		color: var(--text-surface-secondary, #9ca3af);
		margin: 0.25rem 0 0 0;
	}

	.interval-selector {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--surface-primary, #111827);
		padding: 0.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
	}

	.selector-label {
		font-size: 0.75rem;
		color: var(--text-surface-secondary, #9ca3af);
		padding: 0 0.5rem;
		font-weight: 500;
	}

	.interval-btn {
		background: transparent;
		border: none;
		color: var(--text-surface-secondary, #9ca3af);
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.interval-btn:hover {
		color: #ffffff;
	}

	.interval-btn.active {
		background: var(--color-primary, #0153a4);
		color: #ffffff;
	}

	.empty-analytics {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-surface-secondary, #9ca3af);
	}

	.empty-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.kpi-card {
		background: var(--surface-primary, #111827);
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

	.kpi-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-surface-secondary, #9ca3af);
		margin-bottom: 0.25rem;
	}

	.kpi-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-primary, #ffffff);
		line-height: 1.2;
	}

	.kpi-value.small {
		font-size: 1.125rem;
	}

	.unit {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-surface-secondary, #9ca3af);
	}

	.kpi-sub {
		font-size: 0.75rem;
		color: var(--text-surface-secondary, #9ca3af);
		margin-top: 0.375rem;
	}

	.chart-section {
		background: var(--surface-primary, #111827);
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
		border-radius: 0.75rem;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		min-height: 1.75rem;
	}

	.chart-header h3,
	.hourly-section h3 {
		font-size: 0.9375rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary, #ffffff);
	}

	.hover-tooltip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
	}

	.tooltip-time {
		color: var(--text-surface-secondary, #9ca3af);
	}

	.tooltip-count {
		font-weight: 700;
		color: var(--text-primary, #ffffff);
	}

	.peak-badge {
		background: #f59e0b;
		color: #000000;
		font-size: 0.625rem;
		font-weight: 800;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		text-transform: uppercase;
	}

	.histogram-container {
		width: 100%;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}

	.histogram-bars {
		display: flex;
		align-items: flex-end;
		gap: 0.375rem;
		height: 140px;
		min-width: 100%;
		padding-top: 1.5rem;
		border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
	}

	.bar-wrapper {
		flex: 1;
		min-width: 24px;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		position: relative;
		cursor: pointer;
	}

	.bar {
		width: 100%;
		max-width: 40px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 0.25rem 0.25rem 0 0;
		transition: all 0.2s ease;
		position: relative;
		display: flex;
		justify-content: center;
	}

	.bar.has-captures {
		background: var(--color-primary, #0153a4);
	}

	.bar.is-peak {
		background: linear-gradient(180deg, #f59e0b 0%, var(--color-primary, #0153a4) 100%);
	}

	.bar-wrapper:hover .bar {
		filter: brightness(1.25);
		transform: scaleY(1.02);
	}

	.bar-count {
		position: absolute;
		top: -1.25rem;
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--text-primary, #ffffff);
	}

	.bar-label {
		font-size: 0.6875rem;
		color: var(--text-surface-secondary, #9ca3af);
		margin-top: 0.5rem;
		white-space: nowrap;
	}

	.hourly-section {
		background: var(--surface-primary, #111827);
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.hourly-grid {
		display: flex;
		align-items: flex-end;
		height: 80px;
		gap: 2px;
		margin-top: 1rem;
		border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
		padding-bottom: 0.25rem;
	}

	.hourly-col {
		flex: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		position: relative;
	}

	.hourly-bar {
		width: 100%;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px 2px 0 0;
		transition: height 0.3s ease;
	}

	.hourly-bar.active {
		background: var(--color-primary, #0153a4);
		opacity: 0.7;
	}

	.hourly-bar.peak {
		background: #f59e0b;
		opacity: 1;
	}

	.hourly-label {
		position: absolute;
		bottom: -1.25rem;
		font-size: 0.625rem;
		color: var(--text-surface-secondary, #9ca3af);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.analytics-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
