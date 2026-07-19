import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';
import {createCallOverlaySvg, type CallOverlayOptions} from './video/callOverlaySvg';

const ffmpeg = new FFmpeg();
let loaded = false;

const createOverlay = async (options: CallOverlayOptions): Promise<Uint8Array> => {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建视频叠层画布');

  const svgBlob = new Blob([createCallOverlaySvg(options)], {type: 'image/svg+xml'});
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('无法生成视频通话界面'));
    image.src = svgUrl;
  });
  ctx.drawImage(image, 0, 0, 720, 1280);
  URL.revokeObjectURL(svgUrl);

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
  greenSlotScale,
  controlsScale,
  onProgress,
  onStatus,
}: {
  file: File;
  greenSlotScale: number;
  controlsScale: number;
  onProgress: (value: number) => void;
  onStatus: (status: string) => void;
}): Promise<Blob> => {
  await ensureLoaded(onStatus);
  onStatus('正在准备素材…');
  onProgress(0);
  await ffmpeg.writeFile('input-video', await fetchFile(file));
  await ffmpeg.writeFile('call-overlay.png', await createOverlay({greenSlot: true, greenSlotScale, controlsScale}));

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
