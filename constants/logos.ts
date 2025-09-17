export type LogoItem = {
  id: string;
  source: any;
  premium?: boolean;
};

export const TEMPLATE_LOGOS: LogoItem[] = [
  { id: "logo_1", source: require("@/assets/logo/github-logo.png") },
  { id: "logo_2", source: require("@/assets/logo/linkedin-logo.png") },
  { id: "logo_3", source: require("@/assets/logo/logo-instagram-wb.png") },
  { id: "logo_4", source: require("@/assets/logo/logo-instagram.png") },
  { id: "logo_5", source: require("@/assets/logo/youtube-logo.png") },
  { id: "logo_6", source: require("@/assets/logo/wifi-logo.png") },
  { id: "logo_7", source: require("@/assets/logo/wifi-logo-2.png") },
  //   { id: "logo_4", source: require("@/assets/logos/logo4.png"), premium: true },
];
