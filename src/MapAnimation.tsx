import {spring} from 'remotion';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

import { DeckGLMap } from './MapAnimation/DeckGLMap';

export const MapAnimation: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	// Fade out the animation at the end
	const opacity = interpolate(
		frame,
		[durationInFrames - 25, durationInFrames - 15],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill style={{opacity}}>
			
				{/* Sequences can shift the time for its children! */}
				<Sequence from={0}>
					<DeckGLMap />
				</Sequence>
			
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
