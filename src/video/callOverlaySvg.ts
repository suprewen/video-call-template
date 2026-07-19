export type CallOverlayOptions = {
  greenSlot: boolean;
  greenSlotScale: number;
  controlsScale: number;
};

const speakerIcon = (x: number, y: number) => `
  <path d="M${x - 23} ${y - 10}h11l13-12v44l-13-12h-11z" fill="none" />
  <path d="M${x + 4} ${y - 13}c8 7 8 19 0 26M${x + 13} ${y - 21}c14 12 14 30 0 42" />`;

const hangupIcon = (x: number, y: number) => `
  <path d="M${x - 31} ${y + 10}c13-26 49-26 62 0M${x - 31} ${y + 10}l10-10M${x + 31} ${y + 10}l-10-10" />`;

const switchCameraIcon = (x: number, y: number) => `
  <rect x="${x - 27}" y="${y - 19}" width="43" height="38" rx="5" fill="none" />
  <path d="M${x + 17} ${y - 10}l13-9v38l-13-9z" fill="none" />
  <path d="M${x - 12} ${y - 3}a13 13 0 0 1 21-8M${x + 10} ${y - 11}v11H${x - 1}M${x + 12} ${y + 3}a13 13 0 0 1-21 8M${x - 10} ${y + 11}V${y}h11" />`;

export const createCallOverlaySvg = ({greenSlot, greenSlotScale, controlsScale}: CallOverlayOptions) => {
  const greenWidth = 320 * greenSlotScale;
  const greenHeight = 510 * greenSlotScale;
  const green = greenSlot ? `<rect x="${720 - greenWidth}" y="0" width="${greenWidth}" height="${greenHeight}" fill="#00FF00" />` : '';
  const controlScale = controlsScale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    ${green}
    <g transform="translate(360 960) scale(${controlScale}) translate(-360 -960)" font-family="Arial, PingFang SC, sans-serif" fill="#fff" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="126" cy="830" r="64" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.82)" stroke-width="3" />
      <g>${speakerIcon(126, 830)}</g>
      <text x="126" y="933" fill="#fff" stroke="none" font-size="22" font-weight="500" text-anchor="middle" dominant-baseline="middle">切到语音通话</text>

      <circle cx="360" cy="830" r="66" fill="#e83b50" stroke="none" />
      <g>${hangupIcon(360, 830)}</g>
      <text x="360" y="933" fill="#fff" stroke="none" font-size="22" font-weight="500" text-anchor="middle" dominant-baseline="middle">挂断</text>

      <circle cx="594" cy="830" r="64" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.82)" stroke-width="3" />
      <g>${switchCameraIcon(594, 830)}</g>
      <text x="594" y="933" fill="#fff" stroke="none" font-size="22" font-weight="500" text-anchor="middle" dominant-baseline="middle">转换摄像头</text>
    </g>
  </svg>`;
};

export const callOverlayDataUrl = (options: CallOverlayOptions) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createCallOverlaySvg(options))}`;
