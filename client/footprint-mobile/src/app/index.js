// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
//   ImageBackground,
// } from "react-native";
// import { Link } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";


// export default function HomePage() {
//   return (
//     <ImageBackground
//       source={{
//         uri: "https://images.pexels.com/photos/19137171/pexels-photo-19137171.jpeg?cs=srgb&dl=pexels-joe-fikar-799933673-19137171.jpg&fm=jpg",
//       }}
//       style={styles.screen}
//       imageStyle={styles.backgroundImage}
//     >
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.overlay}>
//           <Text style={styles.logo}>👣</Text>

//           <View style={styles.textContainer}>
//             <Text style={styles.title}>EXPLORE</Text>
//             <Text style={styles.title}>YOUR</Text>
//             <Text style={styles.title}>JOURNEY</Text>
//           </View>

//           <View style={styles.buttonGroup}>
//             <Link href="/countries" asChild>
//               <Pressable style={styles.primaryButton}>
//                 <Text style={styles.primaryButtonText}>Start Now</Text>
//               </Pressable>
//             </Link>

//             <Link href="/countries" asChild>
//               <Pressable style={styles.secondaryButton}>
//                 <Text style={styles.secondaryButtonText}>Countries</Text>
//               </Pressable>
//             </Link>

//             <Link href="/registration" asChild>
//               <Pressable style={styles.secondaryButton}>
//                 <Text style={styles.secondaryButtonText}>Registration</Text>
//               </Pressable>
//             </Link>

//             <Link href="/login" asChild>
//               <Pressable style={styles.secondaryButton}>
//                 <Text style={styles.secondaryButtonText}>Login</Text>
//               </Pressable>
//             </Link>

//             <Link href="/profile" asChild>
//               <Pressable style={styles.secondaryButton}>
//                 <Text style={styles.secondaryButtonText}>Profile</Text>
//               </Pressable>
//             </Link>

//             <Link href="/trips" asChild>
//               <Pressable style={styles.secondaryButton}>
//                 <Text style={styles.secondaryButtonText}>Trips</Text>
//               </Pressable>
//             </Link>
//           </View>


//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   backgroundImage: {
//     resizeMode: "cover",
//   },
//   safeArea: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.20)",
//     paddingHorizontal: 20,
//     paddingTop: 8,
//     paddingBottom: 120,
//     justifyContent: "space-between",
//   },
//   logo: {
//     fontSize: 24,
//     textAlign: "center",
//     color: "#fff",
//     marginTop: 8,
//   },
//   textContainer: {
//     marginTop: 20,
//   },
//   title: {
//     fontSize: 46,
//     fontWeight: "800",
//     color: "#fff",
//     lineHeight: 50,
//     letterSpacing: 1,
//   },
//   buttonGroup: {
//     gap: 12,
//     marginTop: 20,
//   },
//   primaryButton: {
//     backgroundColor: "#fff",
//     borderRadius: 999,
//     paddingVertical: 16,
//     alignItems: "center",
//   },
//   primaryButtonText: {
//     fontSize: 18,
//     color: "#222",
//     fontWeight: "500",
//   },
//   secondaryButton: {
//     backgroundColor: "rgba(255,255,255,0.92)",
//     borderRadius: 999,
//     paddingVertical: 13,
//     alignItems: "center",
//   },
//   secondaryButtonText: {
//     fontSize: 16,
//     color: "#222",
//     fontWeight: "500",
//   },
// });
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.pexels.com/photos/19137171/pexels-photo-19137171.jpeg?cs=srgb&dl=pexels-joe-fikar-799933673-19137171.jpg&fm=jpg",
      }}
      style={styles.screen}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <Text style={styles.logo}>👣</Text>

          <View style={styles.textContainer}>
            <Text style={styles.title}>EXPLORE</Text>
            <Text style={styles.title}>YOUR</Text>
            <Text style={styles.title}>JOURNEY</Text>
          </View>

          <View style={styles.buttonGroup}>
            <Link href="/login" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Start Now</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.20)",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 24,
    textAlign: "center",
    color: "#fff",
    marginTop: 8,
  },
  textContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 46,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 50,
    letterSpacing: 1,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
  },
});