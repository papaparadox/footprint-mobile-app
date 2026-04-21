import { useRef, useState, useEffect } from "react"
import {
    View, 
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import ShareCard from "../components/ShareCard";
import { shareAsImage, shareAsLink, copyLink } from "../services/shareService";
import COLOURS from "../constants/colours";
import { getToken } from "../services/tokenService";

const API_BASE_URL = "https://footprint-mobile-app.onrender.com";

export default function ShareScreen() {
    const cardRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [username, setUsername] = useState("");
    const [shareToken, setShareToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            // decode user id from token
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.id;

            // fetch profile
            const profileRes = await fetch(`${API_BASE_URL}/user/profile`, { headers });
            const profileData = await profileRes.json();
            setUsername(profileData.user?.username || "traveller");

            // after fetching profile, get the public token
            const tokenRes = await fetch(`${API_BASE_URL}/user/profile/share-token`, { headers });
            const tokenData = await tokenRes.json();
            setShareToken(tokenData.public_token);

            // fetch stats
            const statsRes = await fetch(`${API_BASE_URL}/stats/${userId}`, { headers });
            const statsData = await statsRes.json();
            setStats(statsData.stats);

            // fetch most recent trip for share token
            const tripsRes = await fetch(`${API_BASE_URL}/trip/user/${userId}`, { headers });
            const tripsData = await tripsRes.json();
            if (tripsData.length > 0) {
                setShareToken(tripsData[0].share_token);
            }
        } catch (error) {
            console.error("Load share data error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShareImage = async () => {
        setSharing(true);
        await shareAsImage(cardRef);
        setSharing(false);
    };

    const handleShareLink = async () => {
        if (!shareToken) {
            Alert.alert("No trips yet", "Create a trip first to share a link.");
            return;
        }
        await shareAsLink(shareToken);
    };

    const handleCopyLink = async () => {
        if (!shareToken) {
            Alert.alert("No trips yet", "Create a trip first to copy a link.");
            return;
        }
        await copyLink(shareToken);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOURS.accent} />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.pageTitle}>Share your Footprint</Text>
            <Text style={styles.pageSubtitle}>
                Show the world how far you've travelled
            </Text>

            {/* card preview */}
            <View style={styles.cardWrapper}>
                <View ref={cardRef} collapsable={false}>
                <ShareCard stats={stats} username={username} />
                </View>
            </View>

            {/* share buttons */}
            <View style={styles.buttonsSection}>
                <Text style={styles.sectionLabel}>Share as</Text>

                <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleShareImage}
                disabled={sharing}
                >
                <Text style={styles.btnIcon}>🖼️</Text>
                <Text style={styles.btnTextPrimary}>
                    {sharing ? "Saving..." : "Image"}
                </Text>
                </Pressable>

                <Pressable
                style={[styles.btn, styles.btnSecondary]}
                onPress={handleShareLink}
                >
                <Text style={styles.btnIcon}>🔗</Text>
                <Text style={styles.btnTextSecondary}>Link</Text>
                </Pressable>

                <Pressable
                style={[styles.btn, styles.btnOutline]}
                onPress={handleCopyLink}
                >
                <Text style={styles.btnIcon}>📋</Text>
                <Text style={styles.btnTextOutline}>Copy Link</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 60,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.bg,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLOURS.textMuted,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLOURS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
    textAlign: "center",
    marginBottom: 32,
  },
  cardWrapper: {
    alignItems: "center",
    marginBottom: 36,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonsSection: {
    width: "100%",
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: COLOURS.accent,
  },
  btnSecondary: {
    backgroundColor: COLOURS.accentLight,
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLOURS.border,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnTextPrimary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  btnTextSecondary: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.accent,
  },
  btnTextOutline: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOURS.textSoft,
  },
});