import { TEMPLATE_LOGOS } from "@/constants/logos";
import { LogoSelection } from "@/types/qr";
import { Asset } from "expo-asset";
import { ImageSourcePropType } from "react-native";

/** 화면 렌더링용 이미지 소스 */
export function getLogoSource(
  logo: LogoSelection | null
): ImageSourcePropType | undefined {
  if (!logo) return undefined;
  if (logo.type === "custom") return { uri: logo.uri };
  return TEMPLATE_LOGOS.find((item) => item.id === logo.id)?.source;
}

/** 파일로 읽을 수 있는 로컬 URI (SVG 내보내기용) */
export async function resolveLogoFileUri(
  logo: LogoSelection | null
): Promise<string | undefined> {
  if (!logo) return undefined;
  if (logo.type === "custom") return logo.uri;
  const item = TEMPLATE_LOGOS.find((it) => it.id === logo.id);
  if (!item) return undefined;
  const asset = Asset.fromModule(item.source);
  if (!asset.localUri) await asset.downloadAsync();
  return asset.localUri ?? undefined;
}
