export type CallOverlayOptions = {
  greenSlot: boolean;
  greenSlotScale: number;
  controlsScale: number;
};

const micIcon = (x: number, y: number) => `
  <rect x="${x - 9}" y="${y - 19}" width="18" height="29" rx="9" fill="none" />
  <path d="M${x - 16} ${y + 1}a16 16 0 0 0 32 0M${x} ${y + 19}v10M${x - 11} ${y + 29}h22" />`;

const speakerIcon = (x: number, y: number) => `
  <path d="M${x - 22} ${y - 10}h11l14-13v46l-14-13h-11z" fill="#111" stroke="none" />
  <path d="M${x + 5} ${y - 13}c8 7 8 19 0 26M${x + 14} ${y - 21}c14 12 14 30 0 42" />`;

const cameraIcon = (x: number, y: number) => `
  <rect x="${x - 25}" y="${y - 16}" width="36" height="32" rx="5" fill="#111" stroke="none" />
  <path d="M${x + 12} ${y - 9}l18-11v40l-18-11z" fill="#111" stroke="none" />`;

const textureIcon = (x: number, y: number) => `
  <rect x="${x - 21}" y="${y - 21}" width="42" height="42" rx="4" fill="none" />
  <path d="M${x - 15} ${y - 9}l9-9m-4 34L${x + 17} ${y - 16}M${x - 18} ${y + 4}l23-23M${x - 6} ${y + 18}l24-24M${x + 5} ${y + 18}l13-13" />`;

const hangupIcon = (x: number, y: number) => `
  <path d="M${x - 30} ${y + 10}c12-25 48-25 60 0M${x - 30} ${y + 10}l10-10M${x + 30} ${y + 10}l-10-10" />`;

const switchIcon = (x: number, y: number) => `
  <path d="M${x - 20} ${y - 4}a23 23 0 0 1 38-13M${x + 19} ${y - 17}v16H${x + 3}M${x + 20} ${y + 4}a23 23 0 0 1-38 13M${x - 19} ${y + 17}v-16h16" />`;

export const createCallOverlaySvg = ({greenSlot, greenSlotScale, controlsScale}: CallOverlayOptions) => {
  const greenWidth = 320 * greenSlotScale;
  const greenHeight = 510 * greenSlotScale;
  const green = greenSlot ? `<rect x="${720 - greenWidth}" y="0" width="${greenWidth}" height="${greenHeight}" fill="#00FF00" />` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    ${green}
    <g transform="translate(360 1190) scale(${controlsScale}) translate(-360 -1190)" font-family="Arial, PingFang SC, sans-serif" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#111" stroke-width="6">
        <circle cx="145" cy="970" r="52" fill="#fff" stroke="none" />
        ${micIcon(145, 970)}
        <circle cx="360" cy="970" r="52" fill="#fff" stroke="none" />
        ${speakerIcon(360, 970)}
        <circle cx="575" cy="970" r="52" fill="#fff" stroke="none" />
        ${cameraIcon(575, 970)}
      </g>
      <g fill="#fff" stroke="none" font-size="16" font-weight="500" text-anchor="middle">
        <text x="145" y="1052">Mic On</text>
        <text x="360" y="1052">Speaker On</text>
        <text x="575" y="1052">Camera On</text>
      </g>

      <g stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="145" cy="1145" r="52" fill="rgba(0,0,0,.78)" stroke="none" />
        ${textureIcon(145, 1145)}
        <circle cx="360" cy="1145" r="52" fill="#ee4d59" stroke="none" />
        ${hangupIcon(360, 1145)}
        <circle cx="575" cy="1145" r="52" fill="rgba(0,0,0,.78)" stroke="none" />
        ${switchIcon(575, 1145)}
      </g>
    </g>
  </svg>`;
};

export const callOverlayDataUrl = (options: CallOverlayOptions) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createCallOverlaySvg(options))}`;
