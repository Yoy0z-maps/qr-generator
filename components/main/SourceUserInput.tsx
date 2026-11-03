import SegmentedControl from "@/components/ui/SegmentedControl";
import TextField from "@/components/ui/TextField";
import { colors, spacing } from "@/constants/theme";
import { SourceForms, SourceMode, WifiSecurity } from "@/types/qr";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import WiFiTypeInfoModal from "./WiFiTypeInfoModal";

type Props = {
  mode: SourceMode;
  forms: SourceForms;
  updateForm: <M extends SourceMode>(mode: M, form: SourceForms[M]) => void;
};

const SECURITY_OPTIONS = [
  { value: "WPA", label: "WPA" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "nopass" },
] as const satisfies readonly { value: WifiSecurity; label: string }[];

export default function SourceUserInput({ mode, forms, updateForm }: Props) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  switch (mode) {
    case "url":
      return (
        <TextField
          placeholder="https://example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={forms.url}
          onChangeText={(url) => updateForm("url", url)}
        />
      );

    case "text":
      return (
        <TextField
          placeholder={t("index.field.text")}
          multiline
          value={forms.text}
          onChangeText={(text) => updateForm("text", text)}
        />
      );

    case "wifi": {
      const wifi = forms.wifi;
      const set = (patch: Partial<typeof wifi>) =>
        updateForm("wifi", { ...wifi, ...patch });
      return (
        <View style={styles.group}>
          <TextField
            placeholder={t("index.ssid")}
            autoCapitalize="none"
            autoCorrect={false}
            value={wifi.ssid}
            onChangeText={(ssid) => set({ ssid })}
          />
          {wifi.security !== "nopass" && (
            <TextField
              placeholder={t("index.password")}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={wifi.password}
              onChangeText={(password) => set({ password })}
            />
          )}
          <SegmentedControl
            options={SECURITY_OPTIONS}
            value={wifi.security}
            onChange={(security) => set({ security })}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t("index.hiddennet")}</Text>
            <Switch
              value={wifi.hidden}
              onValueChange={(hidden) => set({ hidden })}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <Pressable
            style={styles.infoLink}
            onPress={() => setModalOpen(true)}
            hitSlop={8}
          >
            <AntDesign
              name="question-circle"
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>{t("index.wifiType")}</Text>
          </Pressable>
          <WiFiTypeInfoModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </View>
      );
    }

    case "contact": {
      const contact = forms.contact;
      const set = (patch: Partial<typeof contact>) =>
        updateForm("contact", { ...contact, ...patch });
      return (
        <View style={styles.group}>
          <TextField
            placeholder={t("index.field.name")}
            value={contact.name}
            onChangeText={(name) => set({ name })}
          />
          <TextField
            placeholder={t("index.field.phone")}
            keyboardType="phone-pad"
            value={contact.phone}
            onChangeText={(phone) => set({ phone })}
          />
          <TextField
            placeholder={t("index.field.email")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={contact.email}
            onChangeText={(email) => set({ email })}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField
                placeholder={t("index.field.org")}
                value={contact.org}
                onChangeText={(org) => set({ org })}
              />
            </View>
            <View style={styles.flex}>
              <TextField
                placeholder={t("index.field.title")}
                value={contact.title}
                onChangeText={(title) => set({ title })}
              />
            </View>
          </View>
          <TextField
            placeholder={t("index.field.website")}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            value={contact.url}
            onChangeText={(url) => set({ url })}
          />
        </View>
      );
    }

    case "email": {
      const email = forms.email;
      const set = (patch: Partial<typeof email>) =>
        updateForm("email", { ...email, ...patch });
      return (
        <View style={styles.group}>
          <TextField
            placeholder={t("index.field.emailTo")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email.to}
            onChangeText={(to) => set({ to })}
          />
          <TextField
            placeholder={t("index.field.subject")}
            value={email.subject}
            onChangeText={(subject) => set({ subject })}
          />
          <TextField
            placeholder={t("index.field.body")}
            multiline
            value={email.body}
            onChangeText={(body) => set({ body })}
          />
        </View>
      );
    }

    case "phone":
      return (
        <TextField
          placeholder={t("index.field.phone")}
          keyboardType="phone-pad"
          value={forms.phone}
          onChangeText={(phone) => updateForm("phone", phone)}
        />
      );

    case "sms": {
      const sms = forms.sms;
      const set = (patch: Partial<typeof sms>) =>
        updateForm("sms", { ...sms, ...patch });
      return (
        <View style={styles.group}>
          <TextField
            placeholder={t("index.field.smsTo")}
            keyboardType="phone-pad"
            value={sms.phone}
            onChangeText={(phone) => set({ phone })}
          />
          <TextField
            placeholder={t("index.field.message")}
            multiline
            value={sms.message}
            onChangeText={(message) => set({ message })}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  switchLabel: {
    fontSize: 15,
    color: colors.text,
  },
  infoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
