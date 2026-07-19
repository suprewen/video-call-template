import {useEffect, useMemo, useState} from 'react';
import {Player} from '@remotion/player';
import {Download, FileVideo, LoaderCircle, Sparkles, Upload} from 'lucide-react';
import {exportVideoCallTemplate} from './browserExport';
import {VideoCallTemplate} from './video/VideoCallTemplate';

const fallbackVideo = '/demo.mp4';

export const App = () => {
  const [videoSrc, setVideoSrc] = useState(fallbackVideo);
  const [videoName, setVideoName] = useState('示例素材');
  const [sourceFile, setSourceFile] = useState<File>();
  const [durationInFrames, setDurationInFrames] = useState(900);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('上传视频后，可直接在浏览器导出 MP4。');
  const [exportError, setExportError] = useState('');

  useEffect(() => () => {
    if (videoSrc.startsWith('blob:')) URL.revokeObjectURL(videoSrc);
  }, [videoSrc]);

  const inputProps = useMemo(() => ({videoSrc, greenSlot: true}), [videoSrc]);

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
      const blob = await exportVideoCallTemplate({file: sourceFile, onProgress: setProgress, onStatus: setExportStatus});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sourceFile.name.replace(/\.[^.]+$/, '')}-视频通话.mp4`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setExportStatus('导出完成，MP4 已开始下载。');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '未知错误';
      setExportError(`导出引擎启动失败：${message}`);
      setExportStatus('');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main>
      <section className="intro">
        <p className="eyebrow"><Sparkles size={15} /> 视频通话素材</p>
        <h1>视频通话模板生成器</h1>
        <p className="lede">保留原始人物视频，叠加视频通话风格界面与右上角绿幕区域。视频始终留在你的设备上。</p>
      </section>

      <section className="workspace">
        <div className="preview-wrap">
          <Player component={VideoCallTemplate} inputProps={inputProps} durationInFrames={durationInFrames} compositionWidth={720} compositionHeight={1280} fps={30} controls style={{width: '100%', aspectRatio: '9 / 16'}} />
        </div>
        <aside className="panel">
          <div className="panel-head"><span>上传并导出</span></div>
          <label className="upload" htmlFor="video-file"><Upload size={20} /><span><strong>上传视频</strong><small>{videoName}</small></span><input id="video-file" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => chooseFile(event.target.files?.[0])} /></label>
          <div className="render-box"><FileVideo size={20} /><p>{exportStatus || '浏览器端合成出现问题。'}</p>{isExporting ? <div className="progress"><span style={{width: `${progress}%`}} /></div> : null}{exportError ? <small className="error">{exportError}</small> : null}</div>
          <button className="export-button" type="button" onClick={exportVideo} disabled={!sourceFile || isExporting}>{isExporting ? <><LoaderCircle size={18} className="spin" />合成中 {progress}%</> : <><Download size={18} />导出 MP4</>}</button>
          <p className="privacy">首次导出会下载约 31MB 的浏览器渲染引擎。视频不会上传至服务器。</p>
        </aside>
      </section>
    </main>
  );
};
