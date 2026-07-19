import {AbsoluteFill, staticFile, Video} from 'remotion';
import {Mic, MoreHorizontal, PhoneOff, SwitchCamera, Video as VideoIcon, Volume2} from 'lucide-react';

export type VideoCallTemplateProps = {
  videoSrc: string;
  callerName: string;
  greenSlot: boolean;
};

const controlStyle = {
  width: 72,
  height: 72,
  borderRadius: 36,
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
} as const;

export const VideoCallTemplate = ({
  videoSrc,
  callerName,
  greenSlot,
}: VideoCallTemplateProps) => {
  const resolvedVideoSrc = videoSrc.startsWith('blob:') ? videoSrc : staticFile(videoSrc.replace(/^\//, ''));

  return (
    <AbsoluteFill style={{backgroundColor: '#111', fontFamily: 'Arial, "PingFang SC", sans-serif', overflow: 'hidden'}}>
      <Video src={resolvedVideoSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.32), transparent 25%, transparent 72%, rgba(0,0,0,.48))'}} />

      <div style={{position: 'absolute', top: 42, left: 34, right: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontSize: 21, textShadow: '0 1px 5px rgba(0,0,0,.65)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Volume2 size={22} strokeWidth={2.2} /><span>{callerName}</span></div>
        <MoreHorizontal size={29} />
      </div>

      {greenSlot ? (
        <div style={{position: 'absolute', top: 90, right: 26, width: 208, height: 330, background: '#00FF00'}} />
      ) : null}

      <div style={{position: 'absolute', bottom: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 38}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff', fontSize: 17}}><div style={{...controlStyle, background: 'rgba(40,40,40,.72)'}}><Mic size={31} /></div><span>静音</span></div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff', fontSize: 17}}><div style={{...controlStyle, background: '#ef4444'}}><PhoneOff size={31} /></div><span>挂断</span></div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff', fontSize: 17}}><div style={{...controlStyle, background: 'rgba(40,40,40,.72)'}}><VideoIcon size={31} /></div><span>摄像头</span></div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff', fontSize: 17}}><div style={{...controlStyle, background: 'rgba(40,40,40,.72)'}}><SwitchCamera size={30} /></div><span>切换</span></div>
      </div>
    </AbsoluteFill>
  );
};
