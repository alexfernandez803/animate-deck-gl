import DeckGL, {GeoJsonLayer} from 'deck.gl';
import DelayedPointLayer from './DelayedPointLayer';
import {extent, scaleLinear} from 'd3';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import GL from '@luma.gl/constants';
import librariesData from './data/libraries.json';
import {StaticMap} from 'react-map-gl';
import {Extrapolate} from './Utils';

const COUNTRIES =
	'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const MAP_STYLE =
	'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE = {
	longitude: -78.8006344148876,
	latitude: 39.09086893888812,
	bearing: -29.368464314354455,
	zoom: 6.0,
	pitch: 52.84408429581342,
};
const END_VIEW_STATE = {
	longitude: -97.01492690488716,
	latitude: 36.86409651033726,
	bearing: -2.3684643143544513,
	zoom: 3.9115186793818326,
	pitch: 30.894226099945293,
};

const US_CENTER = [-98.5795, 39.8283];

export const DeckGLMap = ({}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const delayeEnd = 10;

	const zoom = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[INITIAL_VIEW_STATE.zoom, END_VIEW_STATE.zoom],
		Extrapolate.CLAMP
	);
	const bearing = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[-29.368464314354455, -2.3684643143544513],
		Extrapolate.CLAMP
	);

	const pitch = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[INITIAL_VIEW_STATE.pitch, END_VIEW_STATE.pitch],
		Extrapolate.CLAMP
	);
	const longitude = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[INITIAL_VIEW_STATE.longitude, END_VIEW_STATE.longitude],
		Extrapolate.CLAMP
	);
	const latitude = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[INITIAL_VIEW_STATE.latitude, END_VIEW_STATE.latitude],
		Extrapolate.CLAMP
	);

	const animationProgress = interpolate(
		frame,
		[0, durationInFrames - delayeEnd],
		[0, 1],
		Extrapolate.CLAMP
	);

	// map longitude to a delay property between 0 and 1
	const longitudeDelayScale = scaleLinear()
		.domain(extent(librariesData, (d) => d.position[0]))
		.range([1, 0]);

	librariesData.forEach((lib) => {
		lib.distToTarget =
			Math.pow(lib.position[0] - US_CENTER[0], 2) +
			Math.pow(lib.position[1] - US_CENTER[1], 2);
	});

	const librariesLayer = new DelayedPointLayer({
		id: 'long-points-layer',
		data: librariesData,
		getPosition: (d) => d.position,
		getFillColor: [250, 100, 200],
		getRadius: 50,
		radiusMinPixels: 3,
		animationProgress: animationProgress,
		// specify the delay factor for each point (value between 0 and 1)
		getDelayFactor: (d) => {
			return longitudeDelayScale(d.position[0]);
		},
		parameters: {
			// prevent flicker from z-fighting
			[GL.DEPTH_TEST]: false,
			// turn on additive blending to make them look more glowy
			[GL.BLEND]: true,
			[GL.BLEND_SRC_RGB]: GL.ONE,
			[GL.BLEND_DST_RGB]: GL.ONE,
			[GL.BLEND_EQUATION]: GL.FUNC_ADD,
		},
	});

	return (
		<DeckGL
			initialViewState={{
				...INITIAL_VIEW_STATE,
				zoom,
				bearing,
				pitch,
				latitude,
				longitude,
			}}
			layers={[librariesLayer]}
		>
			<StaticMap reuseMaps mapStyle={MAP_STYLE} preventStyleDiffing={true} />
		</DeckGL>
	);
};
