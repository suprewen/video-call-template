export type CallOverlayOptions = {
  greenSlot: boolean;
  greenSlotScale: number;
  controlsScale: number;
};

const controls = [
  {x: 198, label: '静音', icon: 'microphone', color: 'rgba(34,34,34,.72)'},
  {x: 310, label: '挂断', icon: 'hangup', color: '#ef4444'},
  {x: 422, label: '摄像头', icon: 'camera', color: 'rgba(34,34,34,.72)'},
  {x: 534, label: '切换', icon: 'switch', color: 'rgba(34,34,34,.72)'},
] as const;

const iconMarkup = (icon: (typeof controls)[number]['icon'], x: number, y: number) => {
  if (icon === 'microphone') return `
    <rect x="${x - 8}" y="${y - 17}" width="16" height="26" rx="8" fill="none" />
    <path d="M${x - 14} ${y + 2}a14 14 0 0 0 28 0M${x} ${y + 16}v8M${x - 9} ${y + 24}h18" />`;
  if (icon === 'hangup') return `
    <path d="M${x - 20} ${y + 8}c8-17 32-17 40 0M${x - 20} ${y + 8}l7-7M${x + 20} ${y + 8}l-7-7" />`;
  if (icon === 'camera') return `
    <rect x="${x - 18}" y="${y - 11}" width="25" height="22" rx="3" fill="none" />
    <path d="M${x + 8} ${y - 6}l11-7v26l-11-7z" fill="none" />`;
  return `
    <path d="M${x - 13} ${y - 3}a16 16 0 0 1 27-9M${x + 14} ${y - 12}v12h-12M${x + 13} ${y + 3}a16 16 0 0 1-27 9M${x - 14} ${y + 12}v-12h12" />`;
};

export const createCallOverlaySvg = ({greenSlot, greenSlotScale, controlsScale}: CallOverlayOptions) => {
  const greenWidth = 312.5 * greenSlotScale;
  const greenHeight = 493.75 * greenSlotScale;
  const green = greenSlot ? `<rect x="${720 - 20 - greenWidth}" y="78" width="${greenWidth}" height="${greenHeight}" fill="#00FF00" />` : '';
  const controlMarkup = controls.map(({x, label, icon, color}) => `
    <circle cx="${x}" cy="1134" r="42" fill="${color}" />
    <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${iconMarkup(icon, x, 1134)}</g>
    <text x="${x}" y="1214" fill="#fff" font-size="17" font-weight="500" text-anchor="middle" dominant-baseline="middle">${label}</text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <defs>
      <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="310" gradientUnits="userSpaceOnUse"><stop stop-color="rgba(0,0,0,.38)" /><stop offset="1" stop-color="rgba(0,0,0,0)" /></linearGradient>
      <linearGradient id="bottomShade" x1="0" y1="940" x2="0" y2="1280" gradientUnits="userSpaceOnUse"><stop stop-color="rgba(0,0,0,0)" /><stop offset="1" stop-color="rgba(0,0,0,.54)" /></linearGradient>
    </defs>
    <rect width="720" height="310" fill="url(#topShade)" />
    <rect y="940" width="720" height="340" fill="url(#bottomShade)" />
    ${green}
    <g transform="translate(360 1260) scale(${1.25 * controlsScale}) translate(-360 -1260)" font-family="Arial, PingFang SC, sans-serif">${controlMarkup}</g>
  </svg>`;
};

export const callOverlayDataUrl = (options: CallOverlayOptions) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createCallOverlaySvg(options))}`;
