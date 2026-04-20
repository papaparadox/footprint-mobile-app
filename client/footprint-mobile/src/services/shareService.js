import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import { Alert } from "react-native";

const BASE_URL = "https://footprint-mobile-app.onrender.com";

export function buildShareLink(shareToken) {
    return `${BASE_URL}/user/public/${shareToken}`;
}

export async function shareAsImage(cardRef) {
    try {
        const uri = await captureRef(cardRef, {
            format: "png",
            quality: 1, 
            result: "tmpfile",
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert("Sharing not available on this device");
            return;
        }

        await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your Footprint",
        });
    } catch (error) {
        console.error("Share image error:", error);
        Alert.alert("Error", "Could not share image. Please try again.");
    }
}

export async function shareAsLink(shareToken) {
    try {
        const link = buildShareLink(shareToken);

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            await copyLink(shareToken);
            return;
        }

        await Sharing.shareAsync(link, {
            dialogTitle: "Share your footprint trip",
        });
    } catch (error) {
        console.error("Share link error:", error);
        Alert.alert("Error", "Could not share link. Please try again!");
    }
}

export async function copyLink(shareToken) {
    try {
        const link = buildShareLink(shareToken);
        await Clipboard.setStringAsync(link);
        Alert.alert("Copied", "Link copied to clipboard");
    } catch (error) {
        console.error("Copy link error:", error);
        Alert.alert("Error", "Could not copy link.");
    }
}