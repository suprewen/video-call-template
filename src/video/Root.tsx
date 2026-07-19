import {Composition} from 'remotion';
import {VideoCallTemplate, type VideoCallTemplateProps} from './VideoCallTemplate';

const defaultProps: VideoCallTemplateProps = {
  videoSrc: '/render-input.mp4',
  callerName: '正在视频通话',
  greenSlot: true,
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="VideoCallTemplate"
      component={VideoCallTemplate}
      durationInFrames={18000}
      fps={30}
      width={720}
      height={1280}
      defaultProps={defaultProps}
    />
  );
};
