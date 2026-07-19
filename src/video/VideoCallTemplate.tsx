import {AbsoluteFill, staticFile, Video} from 'remotion';
import {callOverlayDataUrl} from './callOverlaySvg';

export type VideoCallTemplateProps = {
  videoSrc: string;
  greenSlot: boolean;
  greenSlotScale: number;
  controlsScale: number;
};

export const VideoCallTemplate = ({
  videoSrc,
  greenSlot,
  greenSlotScale,
  controlsScale,
}: VideoCallTemplateProps) => {
  const resolvedVideoSrc = videoSrc.startsWith('blob:') ? videoSrc : staticFile(videoSrc.replace(/^\//, ''));
  const overlaySrc = callOverlayDataUrl({greenSlot, greenSlotScale, controlsScale});

  return (
    <AbsoluteFill style={{backgroundColor: '#111', overflow: 'hidden'}}>
      <Video src={resolvedVideoSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <img src={overlaySrc} alt="" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
