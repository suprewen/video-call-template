import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
let loaded = false;

type CanvasIcon = 'microphone' | 'hangup' | 'camera' | 'switch';

const setIconStroke = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};

const drawIcon = (ctx: CanvasRenderingContext2D, icon: CanvasIcon, x: number, y: number) => {
  setIconStroke(ctx);
  if (icon === 'microphone') {
    ctx.beginPath();
    ctx.roundRect(x - 7, y - 15, 14, 24, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + 3, 13, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 16);
    ctx.lineTo(x, y + 22);
    ctx.moveTo(x - 8, y + 22);
    ctx.lineTo(x + 8, y + 22);
    ctx.stroke();
    return;
  }
  if (icon === 'hangup') {
    ctx.save();
    ctx.translate(x, y + 4);
    ctx.rotate(-0.08);
    ctx.beginPath();
    ctx.arc(0, 9, 20, Math.PI * 1.13, Math.PI * 1.87);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.lineTo(-12, -5);
    ctx.moveTo(18, 2);
    ctx.lineTo(12, -5);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (icon === 'camera') {
    ctx.beginPath();
    ctx.roundRect(x - 17, y - 11, 24, 22, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 6);
    ctx.lineTo(x + 18, y - 12);
    ctx.lineTo(x + 18, y + 12);
    ctx.lineTo(x + 8, y + 6);
    ctx.closePath();
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.arc(x, y, 15, -2.2, 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 15, y - 12);
  ctx.lineTo(x + 15, y - 1);
  ctx.lineTo(x + 4, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 15, 0.94, Math.PI + 0.24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 12);
  ctx.lineTo(x - 15, y + 1);
  ctx.lineTo(x - 4, y + 1);
  ctx.closePath();
  ctx.fill();
};

const createOverlay = async (): Promise<Uint8Array> => {
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
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '700 25px Arial, sans-serif';
  ctx.fillText('•••', 688, 56);

  // 后期合成时可通过色度键移除这块纯绿区域。
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(470, 78, 250, 395);

  const controls: Array<{x: number; label: string; icon: CanvasIcon; color: string}> = [
    {x: 198, label: '静音', icon: 'microphone', color: 'rgba(34,34,34,.72)'},
    {x: 310, label: '挂断', icon: 'hangup', color: '#ef4444'},
    {x: 422, label: '摄像头', icon: 'camera', color: 'rgba(34,34,34,.72)'},
    {x: 534, label: '切换', icon: 'switch', color: 'rgba(34,34,34,.72)'},
  ];
  for (const control of controls) {
    ctx.beginPath();
    ctx.arc(control.x, 1134, 42, 0, Math.PI * 2);
    ctx.fillStyle = control.color;
    ctx.fill();
    ctx.save();
    ctx.translate(control.x, 1134);
    ctx.scale(1.15, 1.15);
    ctx.translate(-control.x, -1134);
    drawIcon(ctx, control.icon, control.x, 1134);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = '500 17px Arial, "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(control.label, control.x, 1214);
  }

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('无法生成叠层图片')), 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
};

const ensureLoaded = async (onStatus: (status: string) => void) => {
  if (loaded) return;
  onStatus('正在下载浏览器端渲染引擎（首次约 31MB）…');
  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  loaded = true;
};

export const exportVideoCallTemplate = async ({
  file,
  onProgress,
  onStatus,
}: {
  file: File;
  onProgress: (value: number) => void;
  onStatus: (status: string) => void;
}): Promise<Blob> => {
  await ensureLoaded(onStatus);
  onStatus('正在准备素材…');
  onProgress(0);
  await ffmpeg.writeFile('input-video', await fetchFile(file));
  await ffmpeg.writeFile('call-overlay.png', await createOverlay());

  const progressHandler = ({progress}: {progress: number}) => onProgress(Math.min(99, Math.max(1, Math.round(progress * 100))));
  ffmpeg.on('progress', progressHandler);
  onStatus('正在合成视频。请不要关闭本页…');
  await ffmpeg.exec([
    '-i', 'input-video', '-i', 'call-overlay.png',
    '-filter_complex', '[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[base];[base][1:v]overlay=0:0:format=auto[outv]',
    '-map', '[outv]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', 'video-call.mp4',
  ]);
  const output = await ffmpeg.readFile('video-call.mp4');
  await ffmpeg.deleteFile('input-video');
  await ffmpeg.deleteFile('call-overlay.png');
  await ffmpeg.deleteFile('video-call.mp4');
  onProgress(100);
  onStatus('导出完成，正在下载…');
  return new Blob([output], {type: 'video/mp4'});
};
