import {Composition} from 'remotion';
import {WechatOrderCall, type WechatOrderCallProps} from './WechatOrderCall';

const defaultProps: WechatOrderCallProps = {
  videoSrc: '/render-input.mp4',
  callerName: '正在视频通话',
  greenSlot: true,
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="WechatOrderCall"
      component={WechatOrderCall}
      durationInFrames={18000}
      fps={30}
      width={720}
      height={1280}
      defaultProps={defaultProps}
    />
  );
};
