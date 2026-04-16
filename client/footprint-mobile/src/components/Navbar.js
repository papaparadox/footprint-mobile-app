import { View, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

const navItems = [
  { route: "/", icon: "home-outline", activeIcon: "home" },
  { route: "/countries", icon: "add-circle-outline", activeIcon: "add-circle" },
  { route: "/profile", icon: "person-outline", activeIcon: "person" },
];

  return (
    <View style={styles.wrapper}>
      <View style={styles.topLine} />

      <View style={styles.navRow}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;

          return (
            <Pressable
              key={item.route}
              onPress={() => router.replace(item.route)}
              style={styles.iconButton}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={30}
                color={isActive ? "#2E8B57" : "#9CA3AF"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 28,
  },
  topLine: {
    height: 2,
    backgroundColor: "#111",
    opacity: 0.9,
    marginBottom: 18,
    borderRadius: 2,
  },
navRow: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
},
topLine: {
  height: 2,
  width: "100%",
  alignSelf: "center",
  backgroundColor: "#111",
  marginBottom: 18,
  borderRadius: 2,
},
});