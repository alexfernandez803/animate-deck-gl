import React from 'react';
import DeckGL, { GeoJsonLayer, ArcLayer, ScatterplotLayer } from 'deck.gl';
import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { useState } from 'react';
import GL from '@luma.gl/constants';
import librariesData from './data/libraries.json';
import { StaticMap } from 'react-map-gl';
import { easeBackInOut } from 'd3';
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: -78.8006344148876,
  latitude: 39.09086893888812,
  bearing: -29.368464314354455,
  zoom: 6.0,
  pitch: 52.84408429581342,
};
const COUNTRY_VIEW_STATE = {
  longitude: -97.01492690488716,
  latitude: 36.86409651033726,
  bearing: -2.3684643143544513,
  zoom: 3.9115186793818326,
  pitch: 30.894226099945293,
};
const COUNTRY2_VIEW_STATE = {
  longitude: -97.01492690488716,
  latitude: 36.86409651033726,
  bearing: 6.3684643143544513,
  zoom: 3.9115186793818326,
  pitch: 40.894226099945293,
};

const librariesAnimation = { enterProgress: 0, duration: 2000 };

export const DeckGLMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const locations = [
    INITIAL_VIEW_STATE,
    COUNTRY_VIEW_STATE,
  ]
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const zoom = interpolate(frame, [0, 20], [6, 3.9115186793818326], {
    extrapolateRight: "clamp",
  });
  const bearing = interpolate(frame, [0, 20, 40], [-29.368464314354455,
  -2.3684643143544513, 6.3684643143544513], {
    extrapolateRight: "clamp",
  });
  const pitch = interpolate(frame, [0, 20, 40], [52.84408429581342, 30.894226099945293, 40.894226099945293], {
    extrapolateRight: "clamp",
  });
  const latlang = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });


  const colorConst = [[255, 255, 255], [60, 100, 200]]
  const radius = [500, 5000]
  const colorAnimate = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    // v--v---v----------------------v
    [0, 1, 1, 0]
  );

  React.useEffect(() => {
    const { latitude, longitude } = locations[Math.max(latlang)] ? locations[Math.max(latlang)] : COUNTRY_VIEW_STATE
    setViewState(
      {
        ...viewState,
        zoom,
        bearing,
        pitch,
        latitude,
        longitude

      }
    )
  }, [zoom, bearing, latlang]);



  return (
    <DeckGL
      initialViewState={viewState}
    >
         <StaticMap reuseMaps mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      <GeoJsonLayer
        id="base-map"
        data={COUNTRIES}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        opacity={0.4}
        getLineColor={[60, 60, 60]}
        getFillColor={[200, 200, 200]}
      />
      <ScatterplotLayer
        id='points-layer'
        data={librariesData}
        getPosition={d => d.position}
        getFillColor={colorConst[colorAnimate]}
        getRadius={radius[colorAnimate]}
        parameters={{
          // prevent flicker from z-fighting
          [GL.DEPTH_TEST]: false,
          // turn on additive blending to make them look more glowy
          [GL.BLEND]: true,
          [GL.BLEND_SRC_RGB]: GL.ONE,
          [GL.BLEND_DST_RGB]: GL.ONE,
          [GL.BLEND_EQUATION]: GL.FUNC_ADD,
        }}
        transitions={
          {
            getFillColor: {
              duration: 3000,
            },
            getRadius: {
              duration: librariesAnimation.duration,
              easing: easeBackInOut,
            }
          }
        }
      />
    </DeckGL>
  );
};

