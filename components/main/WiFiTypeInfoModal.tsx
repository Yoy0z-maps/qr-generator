import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text } from "react-native";

export default function WiFiTypeInfoModal({
  modalOpen,
  setModalOpen,
}: {
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      transparent={true}
      animationType="fade"
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setModalOpen(false)}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>
            {t("index.wifiTypeModal.title")}
          </Text>
          <Text style={styles.modalDescription}>
            {t("index.wifiTypeModal.wpa")}
          </Text>
          <Text style={styles.modalDescription}>
            {t("index.wifiTypeModal.wep")}
          </Text>
          <Text style={styles.modalDescription}>
            {t("index.wifiTypeModal.nopass")}
          </Text>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setModalOpen(false)}
          >
            <Text style={styles.modalCloseButtonText}>
              {t("index.wifiTypeModal.close")}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
