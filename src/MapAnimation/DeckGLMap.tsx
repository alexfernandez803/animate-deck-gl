import DeckGL from 'deck.gl';
import DelayedPointLayer from './DelayedPointLayer';
import {extent, scaleLinear} from 'd3';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import GL from '@luma.gl/constants';
import {librariesData, LibraryData} from './data/libraries';
import {StaticMap} from 'react-map-gl';
import {Extrapolate} from './Utils';

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

const US_CENTER: [number, number] = [-98.5795, 39.8283]; // Replace 'lat' and 'lon' with actual latitude and longitude values.

export const DeckGLMap = () => {
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

	// Map longitude to a delay property between 0 and 1
	const longitudeDelayScale = scaleLinear<number>()
		.domain(extent(librariesData, (d) => d.position[0]))
		.range([1, 0]);

	librariesData.forEach((lib: LibraryData) => {
		lib.distToTarget =
			(lib.position[0] - US_CENTER[0]) ** 2 +
			(lib.position[1] - US_CENTER[1]) ** 2;
	});

	const librariesLayer = new DelayedPointLayer({
		id: 'long-points-layer',
		data: librariesData,
		getPosition: (d) => d.position,
		getFillColor: [250, 100, 200],
		getRadius: 50,
		radiusMinPixels: 3,
		animationProgress,
		// Specify the delay factor for each point (value between 0 and 1)
		getDelayFactor: (d) => {
			return longitudeDelayScale(d.position[0]);
		},
		parameters: {
			// Prevent flicker from z-fighting
			[GL.DEPTH_TEST]: false,
			// Turn on additive blending to make them look more glowy
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
			<StaticMap reuseMaps preventStyleDiffing mapStyle={MAP_STYLE} />
		</DeckGL>
	);
};
