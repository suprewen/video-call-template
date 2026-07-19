import {existsSync, mkdirSync, rmSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const [inputArg, outputArg, nameArg] = process.argv.slice(2);
if (!inputArg) {
  console.error('用法：npm run render -- <输入视频> [输出文件] [联系人名称]');
  process.exit(1);
}

const input = resolve(inputArg);
const output = resolve(outputArg ?? `out/${basename(input).replace(/\.[^.]+$/, '')}-wechat-order.mp4`);
const callerName = nameArg ?? '正在视频通话';
if (!existsSync(input)) {
  console.error(`找不到输入视频：${input}`);
  process.exit(1);
}
mkdirSync(resolve('public'), {recursive: true});
mkdirSync(resolve(output, '..'), {recursive: true});
rmSync(resolve('public/render-input.mp4'), {force: true});
const normalize = spawnSync('ffmpeg', ['-y', '-i', input, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', resolve('public/render-input.mp4')], {stdio: 'inherit'});
if (normalize.status !== 0) {
  console.error('无法转换输入视频为浏览器可渲染的 H.264：', normalize.error ?? 'ffmpeg failed');
  process.exit(1);
}

const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', input], {encoding: 'utf8'});
if (probe.status !== 0) {
  console.error('无法读取视频时长：', probe.stderr);
  process.exit(1);
}
const frames = Math.max(1, Math.ceil(Number(probe.stdout.trim()) * 30));
const props = JSON.stringify({videoSrc: '/render-input.mp4', callerName, greenSlot: true});
const result = spawnSync('npx', ['remotion', 'render', 'src/remotion.ts', 'WechatOrderCall', output, `--frames=0-${frames - 1}`, '--codec=h264', `--props=${props}`], {stdio: 'inherit'});
process.exit(result.status ?? 1);
