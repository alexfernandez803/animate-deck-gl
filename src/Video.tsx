import {Composition} from 'remotion';
import {MapAnimation} from './MapAnimation';

// Each <Composition> is an entry in the sidebar!

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				// You can take the "id" to render a video:
				// npx remotion render src/index.tsx <id> out/video.mp4
				id="MapAnimation"
				component={MapAnimation}
				durationInFrames={250}
				fps={100}
				width={1920}
				height={1080}
		
			/>
		
		</>
	);
};
