// QRPreview.tsx
import PreviewShield from "@/components/main/PreviewShield";
import StyledQRCode from "@/components/main/StyledQRCode";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import Checkerboard from "@/components/ui/Checkerboard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  PREVIEW_PROTECTION_ENABLED,
  REWARDED_AD_UNIT_ID,
} from "@/constants/ads";
import { colors, radius, spacing } from "@/constants/theme";
import { HistoryDraft, useHistory } from "@/context/HistoryContext";
import { useQREditor } from "@/context/QREditorContext";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { useRewarded } from "@/hooks/useRewards";
import { QRStyle } from "@/types/qr";
import { getScanWarnings } from "@/utils/colorContrast";
import { exportSvgQR } from "@/utils/exportAsSvg";
import { getLogoSource, resolveLogoFileUri } from "@/utils/logo";
import { createQRMatrix, QRMatrix } from "@/utils/qrMatrix";
import { Ionicons } from "@expo/vector-icons";
import * as Legacy from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ImageSourcePropType,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg from "react-native-svg";
import { captureRef } from "react-native-view-shot";

const CAPTURE_PADDING = 12;
/** 미리보기 QR 최대 크기: 좁은 창(iPhone) / 넓은 창(iPad·Mac) */
const MAX_QR_SIZE = { compact: 260, regular: 380 };
const ALBUM_NAME = "QR Codes";
const PNG_RESOLUTIONS = ["1024", "2048"] as const;
type PngResolution = (typeof PNG_RESOLUTIONS)[number];

function Notice({
  tone,
  icon,
  text,
}: {
  tone: "warning" | "info";
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const warning = tone === "warning";
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: warning ? colors.warningSoft : colors.primarySoft },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={warning ? colors.warning : colors.primary}
      />
      <Text
        style={[
          styles.noticeText,
          { color: warning ? colors.warning : colors.primary },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * PNG 저장용으로 화면 밖에 그리는 QR.
 * toDataURL에 크기를 넘기면 iOS에서는 내용이 확대되지 않으므로,
 * 목표 픽셀 크기 / 화면 배율 만큼의 포인트 크기로 그린 뒤 크기 지정 없이 toDataURL을 호출한다.
 */
function OffscreenQR({
  size,
  matrix,
  qrStyle,
  logo,
  svgRef,
  onReady,
}: {
  size: number;
  matrix: QRMatrix;
  qrStyle: QRStyle;
  logo?: ImageSourcePropType;
  svgRef: React.Ref<Svg>;
  onReady: () => void;
}) {
  const calledRef = useRef(false);
  const ready = () => {
    if (calledRef.current) return;
    calledRef.current = true;
    // 네이티브 뷰 마운트/레이아웃이 끝난 다음 프레임에 렌더링
    requestAnimationFrame(() => requestAnimationFrame(onReady));
  };

  useEffect(() => {
    if (!logo) {
      ready();
      return;
    }
    // 로고 onLoad가 오지 않는 경우를 대비한 대기 상한
    const timer = setTimeout(ready, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: -100000, top: 0, width: size, height: size }}
    >
      <StyledQRCode
        svgRef={svgRef}
        matrix={matrix}
        size={size}
        qrStyle={qrStyle}
        logo={logo}
        onLogoLoad={ready}
      />
    </View>
  );
}

export default function QRPreview() {
  const { t } = useTranslation();
  const { value, mode, forms, style, logo } = useQREditor();
  const history = useHistory();
  const { width: windowWidth, isRegular } = useLayoutMode();
  // 미리보기 영역의 실제 너비 (2단 레이아웃·분할 화면·창 크기 변경에 맞춰 QR 크기 조절)
  const [stageWidth, setStageWidth] = useState(0);

  const exportSvgRef = useRef<Svg>(null);
  const shotRef = useRef<View>(null);
  // PNG 저장 중에만 화면 밖 QR을 그린다 (포인트 단위 크기)
  const [offscreenSize, setOffscreenSize] = useState<number | null>(null);
  const offscreenReadyRef = useRef<(() => void) | null>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState<false | "ad" | "work">(false);
  const [resolution, setResolution] = useState<PngResolution>("1024");
  const { enabled: rewardedEnabled, waitUntilLoaded, show } =
    useRewarded(REWARDED_AD_UNIT_ID);

  // 첫 레이아웃 전에는 한 열 기준(화면 패딩 + 카드 패딩)으로 추정
  const availableWidth =
    (stageWidth || windowWidth - spacing.lg * 4) - CAPTURE_PADDING * 2;
  const qrSize = Math.max(
    120,
    Math.floor(
      Math.min(isRegular ? MAX_QR_SIZE.regular : MAX_QR_SIZE.compact, availableWidth)
    )
  );

  // 타이핑 중에는 입력 반응을 우선하고, QR 렌더는 여유가 생길 때 최신 값으로 갱신
  const deferredValue = useDeferredValue(value);
  const safeValue = deferredValue.trim();

  // 값이 바뀔 때만 매트릭스 생성 (QR 용량 초과 시 null)
  const matrix = useMemo(
    () => (safeValue ? createQRMatrix(safeValue, "H") : null),
    [safeValue]
  );
  const canRender = matrix !== null;
  const tooLong = safeValue.length > 0 && matrix === null;

  const logoSource = getLogoSource(logo);
  const warnings = useMemo(() => getScanWarnings(style), [style]);

  const draft: HistoryDraft = {
    value: safeValue,
    mode,
    form: forms[mode],
    style,
    logo,
  };
  const saved = canRender ? history.findSame(draft) : undefined;
  const isFavorite = !!saved?.favorite;

  function toggleFavorite() {
    if (saved) history.toggleFavorite(saved.id);
    else history.record(draft, { favorite: true });
  }

  /** 벡터 그대로 지정한 픽셀 크기의 PNG로 렌더링 (화면 캡처보다 선명) */
  function renderPngBase64(pixelSize: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("toDataURL timeout")),
        8000
      );
      offscreenReadyRef.current = () => {
        const svg = exportSvgRef.current;
        if (!svg) {
          clearTimeout(timer);
          reject(new Error("QR is not rendered"));
          return;
        }
        svg.toDataURL((base64) => {
          clearTimeout(timer);
          resolve(base64);
        });
      };
      // 레이아웃이 정수 포인트로 반올림되므로 올림해서 목표 픽셀보다 작아지지 않게 함
      setOffscreenSize(Math.ceil(pixelSize / PixelRatio.get()));
    }).finally(() => {
      offscreenReadyRef.current = null;
      setOffscreenSize(null);
    });
  }

  async function saveToGallery() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("index.permissionTitle"), t("index.permissionMessage"));
        return;
      }

      const size = Number(resolution);
      let fileUri: string;
      try {
        const base64 = await renderPngBase64(size);
        fileUri = `${Legacy.cacheDirectory}qr_${Date.now()}.png`;
        await Legacy.writeAsStringAsync(fileUri, base64, {
          encoding: Legacy.EncodingType.Base64,
        });
      } catch (e) {
        // 일부 환경에서 SVG 렌더링이 실패하면 화면 캡처로 대체
        // (프리뷰 보호 오버레이는 캡처 대상 바깥이라 포함되지 않음)
        console.warn("[QRPreview] toDataURL failed, falling back to capture", e);
        fileUri = await captureRef(shotRef, {
          format: "png",
          quality: 1,
          width: size,
          height: size,
        });
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);

      // 앨범 정리는 부가 기능: 실패해도 사진은 이미 저장된 상태
      try {
        // 같은 이름의 앨범이 매번 새로 생성되지 않도록 기존 앨범을 재사용
        const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
        }
      } catch (e) {
        console.warn("[QRPreview] failed to add asset to album", e);
      }

      history.record(draft);
      Alert.alert(t("index.saveDoneTitle"), t("index.saveDoneMessage"));
    } catch (e) {
      console.warn("[QRPreview] saveToGallery failed", e);
      Alert.alert(t("index.saveErrorTitle"), t("index.saveErrorMessage"));
    }
  }

  async function exportSvg() {
    try {
      const logoUri = await resolveLogoFileUri(logo);
      await exportSvgQR({ value: safeValue, style, logoUri });
      history.record(draft);
    } catch (e) {
      console.warn("[QRPreview] exportSvg failed", e);
      Alert.alert(t("index.exportErrorTitle"), t("index.exportErrorMessage"));
    }
  }

  // 리워드 광고 시청 후 작업 실행 (iOS만).
  // - 광고 로드 실패 시 최대 3회 재시도, 그래도 실패하면 광고 없이 바로 실행
  // - 보상 획득 전에 광고를 닫으면 실행하지 않음
  // - 작업 자체의 실패는 각 작업에서 처리 (광고 실패와 구분해 중복 실행 방지)
  async function runWithReward(task: () => Promise<void>) {
    if (busyRef.current) return; // 연타 시 광고/저장 중복 방지
    busyRef.current = true;
    try {
      let earned = true;
      if (rewardedEnabled) {
        setBusy("ad");
        const ready = await waitUntilLoaded();
        if (ready) {
          try {
            earned = await show();
          } catch {
            earned = true; // 노출 실패 → 광고 없이 진행
          }
        }
      }
      setBusy("work");
      if (earned) {
        await task();
      } else {
        Alert.alert(t("index.rewardNotEarned"));
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const frameSize = qrSize + CAPTURE_PADDING * 2;

  return (
    <Card
      title={t("index.section.preview")}
      icon="qr-code-outline"
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? t("index.removeFavorite") : t("index.addFavorite")
          }
          accessibilityState={{ disabled: !canRender, selected: isFavorite }}
          disabled={!canRender}
          onPress={toggleFavorite}
          hitSlop={10}
          style={{ opacity: canRender ? 1 : 0.3 }}
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={24}
            color={isFavorite ? colors.favorite : colors.textSecondary}
          />
        </Pressable>
      }
    >
      <View
        style={styles.stage}
        onLayout={(e) => setStageWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.frame, { width: frameSize, height: frameSize }]}>
          {/* 투명 배경 표시용 체크무늬 (캡처 대상 바깥) */}
          {style.transparentBg && (
            <View style={StyleSheet.absoluteFill}>
              <Checkerboard width={frameSize} height={frameSize} />
            </View>
          )}

          <View
            ref={shotRef}
            collapsable={false}
            style={{
              padding: CAPTURE_PADDING,
              backgroundColor: style.transparentBg
                ? "transparent"
                : style.bgColor,
            }}
          >
            <View style={{ width: qrSize, height: qrSize }}>
              {canRender ? (
                <StyledQRCode
                  matrix={matrix}
                  size={qrSize}
                  qrStyle={style}
                  logo={logoSource}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons
                    name={tooLong ? "alert-circle-outline" : "qr-code-outline"}
                    size={44}
                    color={tooLong ? colors.danger : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.placeholderText,
                      tooLong && { color: colors.danger },
                    ]}
                  >
                    {tooLong ? t("index.tooLong") : t("index.inputValue")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 🔒 프리뷰 보호 오버레이: 캡처 대상(shotRef)의 형제 뷰로 두어 화면에만 보이고 저장 이미지에는 포함되지 않음 */}
          {canRender && PREVIEW_PROTECTION_ENABLED && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: CAPTURE_PADDING,
                left: CAPTURE_PADDING,
                width: qrSize,
                height: qrSize,
              }}
            >
              <PreviewShield width={qrSize} height={qrSize} active text="PREVIEW" />
            </View>
          )}
        </View>
      </View>

      {canRender && offscreenSize !== null && (
        <OffscreenQR
          size={offscreenSize}
          matrix={matrix}
          qrStyle={style}
          logo={logoSource}
          svgRef={exportSvgRef}
          onReady={() => offscreenReadyRef.current?.()}
        />
      )}

      {canRender && warnings.includes("lowContrast") && (
        <Notice tone="warning" icon="warning-outline" text={t("index.warning.lowContrast")} />
      )}
      {canRender && warnings.includes("inverted") && (
        <Notice tone="warning" icon="contrast-outline" text={t("index.warning.inverted")} />
      )}
      {canRender && style.transparentBg && (
        <Notice tone="info" icon="information-circle-outline" text={t("index.warning.transparent")} />
      )}

      {PREVIEW_PROTECTION_ENABLED && (
        <Text style={styles.caption}>{t("index.protectPreview")}</Text>
      )}

      <View style={styles.resolutionRow}>
        <Text style={styles.resolutionLabel}>{t("index.resolution")}</Text>
        <View style={styles.flex}>
          <SegmentedControl
            options={PNG_RESOLUTIONS.map((r) => ({ value: r, label: `${r}px` }))}
            value={resolution}
            onChange={setResolution}
          />
        </View>
      </View>

      <AppButton
        title={busy === "ad" ? t("index.loadingAd") : t("index.saveToGallery")}
        icon="download-outline"
        disabled={!canRender}
        loading={!!busy}
        onPress={() => runWithReward(saveToGallery)}
      />
      <AppButton
        title={t("index.exportAsSvg")}
        icon="share-outline"
        variant="secondary"
        disabled={!canRender || !!busy}
        onPress={() => runWithReward(exportSvg)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: "center",
  },
  frame: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  placeholderText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
  },
  resolutionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  resolutionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  flex: {
    flex: 1,
  },
});
