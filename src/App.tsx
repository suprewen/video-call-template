import {useEffect, useMemo, useState} from 'react';
import {Player} from '@remotion/player';
import {Download, FileVideo, LoaderCircle, Sparkles, Upload} from 'lucide-react';
import {exportOrderVideo} from './browserExport';
import {WechatOrderCall} from './video/WechatOrderCall';

const fallbackVideo = '/demo.mp4';

export const App = () => {
  const [videoSrc, setVideoSrc] = useState(fallbackVideo);
  const [videoName, setVideoName] = useState('示例素材');
  const [sourceFile, setSourceFile] = useState<File>();
  const [callerName, setCallerName] = useState('正在视频通话');
  const [durationInFrames, setDurationInFrames] = useState(900);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('上传视频后，可直接在浏览器导出 MP4。');
  const [exportError, setExportError] = useState('');

  useEffect(() => () => {
    if (videoSrc.startsWith('blob:')) URL.revokeObjectURL(videoSrc);
  }, [videoSrc]);

  const inputProps = useMemo(() => ({videoSrc, callerName, statusText: '正在为你介绍菜单', greenSlot: true}), [videoSrc, callerName]);

  const chooseFile = (file?: File) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.src = objectUrl;
    probe.onloadedmetadata = () => setDurationInFrames(Math.max(1, Math.ceil(probe.duration * 30)));
    setVideoSrc(objectUrl);
    setVideoName(file.name);
    setSourceFile(file);
    setProgress(0);
    setExportError('');
    setExportStatus('素材已就绪。点击“导出 MP4”开始本地合成。');
  };

  const exportVideo = async () => {
    if (!sourceFile || isExporting) return;
    setIsExporting(true);
    setExportError('');
    try {
      const blob = await exportOrderVideo({file: sourceFile, callerName, onProgress: setProgress, onStatus: setExportStatus});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sourceFile.name.replace(/\.[^.]+$/, '')}-直播点单.mp4`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setExportStatus('导出完成，MP4 已开始下载。');
    } catch (error) {
      console.error(error);
      setExportError('导出失败。请换用 MP4/MOV，或在桌面端 Chrome/Safari 重试。');
      setExportStatus('');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main>
      <section className="intro">
        <p className="eyebrow"><Sparkles size={15} /> REMOTION TEMPLATE · IN-BROWSER EXPORT</p>
        <h1>直播点单视频模板</h1>
        <p className="lede">保留原始人物视频，只叠加视频通话界面与可抠像的商品直播位。视频始终留在你的设备上。</p>
      </section>

      <section className="workspace">
        <div className="preview-wrap">
          <Player component={WechatOrderCall} inputProps={inputProps} durationInFrames={durationInFrames} compositionWidth={720} compositionHeight={1280} fps={30} controls style={{width: '100%', aspectRatio: '9 / 16'}} />
        </div>
        <aside className="panel">
          <div className="panel-head"><span>模板参数</span><span className="live-dot">本地处理</span></div>
          <label className="upload" htmlFor="video-file"><Upload size={20} /><span><strong>上传人物视频</strong><small>{videoName}</small></span><input id="video-file" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => chooseFile(event.target.files?.[0])} /></label>
          <label className="field"><span>通话名称</span><input value={callerName} maxLength={18} onChange={(event) => setCallerName(event.target.value)} /></label>
          <div className="slot-note"><div className="green-swatch" /><div><strong>右上角商品位已锁定</strong><span>纯绿 #00FF00 · 直播软件色度键抠像</span></div></div>
          <div className="render-box"><FileVideo size={20} /><p>{exportStatus || '浏览器端合成出现问题。'}</p>{isExporting ? <div className="progress"><span style={{width: `${progress}%`}} /></div> : null}{exportError ? <small className="error">{exportError}</small> : null}</div>
          <button className="export-button" type="button" onClick={exportVideo} disabled={!sourceFile || isExporting}>{isExporting ? <><LoaderCircle size={18} className="spin" />合成中 {progress}%</> : <><Download size={18} />导出 MP4</>}</button>
          <p className="privacy">首次导出会下载约 31MB 的浏览器渲染引擎。视频不会上传至服务器。</p>
        </aside>
      </section>

      <section className="steps">
        <div><b>01</b><h2>上传素材</h2><p>视频在浏览器本地读取，预览自动套入 9:16 通话画面。</p></div>
        <div><b>02</b><h2>直接导出</h2><p>在网页内完成合成并下载 MP4，无需安装剪映或运行命令。</p></div>
        <div><b>03</b><h2>直播叠商品</h2><p>在 OBS 或直播伴侣对绿色商品位启用色度键。</p></div>
      </section>
    </main>
  );
};
