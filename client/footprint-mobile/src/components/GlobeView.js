// import { View, StyleSheet } from "react-native";
// import { WebView } from "react-native-webview";
// // import Navbar from "../components/Navbar";

// function buildHtml(selectedCountries = []) {
//   return `
// <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="UTF-8" />
//     <meta
//       name="viewport"
//       content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
//     />
//     <style>
//       html, body, #globeViz {
//         margin: 0;
//         padding: 0;
//         width: 100%;
//         height: 100%;
//         background: #e9eef3;
//         overflow: hidden;
//       }
//     </style>
//   </head>
//   <body>
//     <div id="globeViz"></div>

//     <script src="https://unpkg.com/three"></script>
//     <script src="https://unpkg.com/globe.gl"></script>

//     <script>
//       const selectedCountries = ${JSON.stringify(selectedCountries)};

//       const globe = Globe()(document.getElementById('globeViz'))
//         .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
//         .backgroundColor('#e9eef3')
//         .showAtmosphere(true)
//         .atmosphereColor('#7fb3ff')
//         .atmosphereAltitude(0.15);

//       globe.controls().autoRotate = true;
//       globe.controls().autoRotateSpeed = 0.6;
//       globe.pointOfView({ altitude: 2.2 });

//       fetch('https://unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
//         .then(res => res.json())
//         .then(countries => {
//           globe
//         .polygonsData(countries.features)
//         .polygonCapColor((polygon) => {
//         const countryName = polygon.properties.ADMIN;
//         return selectedCountries.includes(countryName)
//             ? 'rgba(34, 197, 94, 0.85)'
//             : 'rgba(255, 255, 255, 0.03)';
//         })
//         .polygonSideColor((polygon) => {
//         const countryName = polygon.properties.ADMIN;
//         return selectedCountries.includes(countryName)
//             ? 'rgba(34, 197, 94, 0.35)'
//             : 'rgba(255, 255, 255, 0.01)';
//         })
//         .polygonStrokeColor((polygon) => {
//         const countryName = polygon.properties.ADMIN;
//         return selectedCountries.includes(countryName)
//             ? '#ffffff'
//             : 'rgba(255, 255, 255, 0.06)';
//         })
//             .polygonLabel((d) => d.properties.ADMIN)
//             .onPolygonClick((polygon) => {
//               window.ReactNativeWebView.postMessage(
//                 JSON.stringify({
//                   type: 'country-click',
//                   name: polygon.properties.ADMIN
//                 })
//               );
//             });
//         })
//         .catch(err => {
//           window.ReactNativeWebView.postMessage(
//             JSON.stringify({
//               type: 'globe-error',
//               message: String(err)
//             })
//           );
//         });
//     </script>
//   </body>
// </html>
// `;
// }

// export default function GlobeView({ onMessage, selectedCountries = [] }) {
//   return (
//     <View style={styles.container}>
//       <WebView
//         originWhitelist={["*"]}
//         source={{ html: buildHtml(selectedCountries) }}
//         javaScriptEnabled
//         domStorageEnabled
//         onMessage={onMessage}
//         style={styles.webview}
//       />
//       {/* <Navbar /> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     height: 420,
//     width: "100%",
//     borderRadius: 24,
//     overflow: "hidden",
//     backgroundColor: "#e9eef3",
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: "transparent",
//   },
// });
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useRef } from "react";

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    <style>
      html, body, #globeViz {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #e9eef3;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="globeViz"></div>

    <script src="https://unpkg.com/three"></script>
    <script src="https://unpkg.com/globe.gl"></script>

    <script>
      let selectedCountries = [];
      let countriesData = [];
      let globe;

      function isSelected(countryName) {
        return selectedCountries.includes(countryName);
      }

      function applyCountryStyles() {
        if (!globe || !countriesData.length) return;

        globe
          .polygonsData(countriesData)
          .polygonCapColor((polygon) => {
            const countryName = polygon.properties.ADMIN;
            return isSelected(countryName)
                ? 'rgba(34, 197, 94, 0.9)'
                : 'rgba(0, 0, 0, 0)';
            })
            .polygonSideColor((polygon) => {
            const countryName = polygon.properties.ADMIN;
            return isSelected(countryName)
                ? 'rgba(34, 197, 94, 0.35)'
                : 'rgba(0, 0, 0, 0)';
            })
            .polygonStrokeColor((polygon) => {
            const countryName = polygon.properties.ADMIN;
            return isSelected(countryName)
                ? '#ffffff'
                : 'rgba(0, 0, 0, 0)';
            })
            .polygonAltitude((polygon) => {
            const countryName = polygon.properties.ADMIN;
            return isSelected(countryName) ? 0.03 : 0;
            })
          .polygonLabel((d) => d.properties.ADMIN)
          .onPolygonClick((polygon) => {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'country-click',
                name: polygon.properties.ADMIN
              })
            );
          });
      }

      function updateSelectedCountries(nextSelectedCountries) {
        selectedCountries = nextSelectedCountries;
        applyCountryStyles();
      }

      window.updateSelectedCountries = updateSelectedCountries;

      globe = Globe()(document.getElementById('globeViz'))
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundColor('#e9eef3')
        .showAtmosphere(true)
        .atmosphereColor('#7fb3ff')
        .atmosphereAltitude(0.15);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.6;
      globe.pointOfView({ altitude: 2.2 });

      fetch('https://unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countries => {
          countriesData = countries.features;
          applyCountryStyles();
        })
        .catch(err => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'globe-error',
              message: String(err)
            })
          );
        });
    </script>
  </body>
</html>
`;

export default function GlobeView({ onMessage, selectedCountries = [] }) {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (!webViewRef.current) return;

    const script = `
      window.updateSelectedCountries(${JSON.stringify(selectedCountries)});
      true;
    `;

    webViewRef.current.injectJavaScript(script);
  }, [selectedCountries]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 360,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e9eef3",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});