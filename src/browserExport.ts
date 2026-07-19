import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
let loaded = false;

const CORE_VERSION = '0.12.10';

const createOverlay = async (callerName: string, statusText: string): Promise<Uint8Array> => {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建视频叠层画布');

  const topShade = ctx.createLinearGradient(0, 0, 0, 310);
  topShade.addColorStop(0, 'rgba(0,0,0,0.38)');
  topShade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, 720, 310);
  const bottomShade = ctx.createLinearGradient(0, 940, 0, 1280);
  bottomShade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomShade.addColorStop(1, 'rgba(0,0,0,0.54)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, 940, 720, 340);

  ctx.fillStyle = '#fff';
  ctx.font = '600 21px Arial, PingFang SC, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('◖  ' + callerName.slice(0, 18), 34, 66);
  ctx.textAlign = 'right';
  ctx.font = '700 28px Arial, sans-serif';
  ctx.fillText('···', 688, 62);

  // 直播软件通过色度键移除这块纯绿区域。
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(486, 90, 208, 330);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = '600 25px Arial, PingFang SC, sans-serif';
  ctx.fillText(statusText, 360, 1058);

  const controls = [
    {x: 164, label: '静音', icon: '♩', color: 'rgba(34,34,34,.72)'},
    {x: 290, label: '挂断', icon: '⌁', color: '#ef4444'},
    {x: 416, label: '摄像头', icon: '▣', color: 'rgba(34,34,34,.72)'},
    {x: 542, label: '切换', icon: '◫', color: 'rgba(34,34,34,.72)'},
  ];
  for (const control of controls) {
    ctx.beginPath();
    ctx.arc(control.x, 1140, 36, 0, Math.PI * 2);
    ctx.fillStyle = control.color;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '500 29px Arial, sans-serif';
    ctx.fillText(control.icon, control.x, 1151);
    ctx.font = '500 17px Arial, PingFang SC, sans-serif';
    ctx.fillText(control.label, control.x, 1210);
  }

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('无法生成叠层图片')), 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
};

const ensureLoaded = async (onStatus: (status: string) => void) => {
  if (loaded) return;
  onStatus('正在下载浏览器端渲染引擎（首次约 31MB）…');
  const baseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  loaded = true;
};

export const exportOrderVideo = async ({
  file,
  callerName,
  onProgress,
  onStatus,
}: {
  file: File;
  callerName: string;
  onProgress: (value: number) => void;
  onStatus: (status: string) => void;
}): Promise<Blob> => {
  await ensureLoaded(onStatus);
  onStatus('正在准备素材…');
  onProgress(0);
  await ffmpeg.writeFile('input-video', await fetchFile(file));
  await ffmpeg.writeFile('call-overlay.png', await createOverlay(callerName, '正在为你介绍菜单'));

  const progressHandler = ({progress}: {progress: number}) => onProgress(Math.min(99, Math.max(1, Math.round(progress * 100))));
  ffmpeg.on('progress', progressHandler);
  onStatus('正在合成视频。请不要关闭本页…');
  await ffmpeg.exec([
    '-i', 'input-video', '-i', 'call-overlay.png',
    '-filter_complex', '[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[base];[base][1:v]overlay=0:0:format=auto[outv]',
    '-map', '[outv]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', 'order-call.mp4',
  ]);
  const output = await ffmpeg.readFile('order-call.mp4');
  await ffmpeg.deleteFile('input-video');
  await ffmpeg.deleteFile('call-overlay.png');
  await ffmpeg.deleteFile('order-call.mp4');
  onProgress(100);
  onStatus('导出完成，正在下载…');
  return new Blob([output], {type: 'video/mp4'});
};
