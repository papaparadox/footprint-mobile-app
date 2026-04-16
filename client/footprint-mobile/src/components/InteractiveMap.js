import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

const COUNTRIES = [
  { name: "Canada", x: 35, y: 45, width: 70, height: 35 },
  { name: "USA", x: 45, y: 90, width: 85, height: 40 },
  { name: "Brazil", x: 105, y: 165, width: 75, height: 45 },
  { name: "UK", x: 205, y: 70, width: 35, height: 25 },
  { name: "France", x: 245, y: 95, width: 40, height: 28 },
  { name: "Nigeria", x: 250, y: 160, width: 50, height: 35 },
  { name: "India", x: 365, y: 145, width: 55, height: 38 },
  { name: "China", x: 430, y: 110, width: 80, height: 50 },
  { name: "Japan", x: 535, y: 110, width: 35, height: 35 },
  { name: "Australia", x: 500, y: 235, width: 85, height: 48 },
];

export default function InteractiveMap({
  selectedCountries = [],
  onToggleCountry,
}) {
  const isSelected = (countryName) => selectedCountries.includes(countryName);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.helperText}>Tap a country to add or remove it</Text>

      <Svg width="100%" height={330} viewBox="0 0 620 330">
        <Rect x="0" y="0" width="620" height="330" rx="26" fill="#E9EEF3" />

        {COUNTRIES.map((country) => {
          const selected = isSelected(country.name);

          return (
            <Rect
              key={country.name}
              x={country.x}
              y={country.y}
              width={country.width}
              height={country.height}
              rx={12}
              fill={selected ? "#2E8B57" : "#BFD3C1"}
              stroke={selected ? "#1F5F3B" : "#8FA79A"}
              strokeWidth={2}
              onPress={() => onToggleCountry(country.name)}
            />
          );
        })}

        {COUNTRIES.map((country) => (
          <SvgText
            key={`${country.name}-label`}
            x={country.x + country.width / 2}
            y={country.y + country.height / 2 + 5}
            fontSize="10"
            fontWeight="700"
            fill="#173127"
            textAnchor="middle"
            pointerEvents="none"
          >
            {country.name}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 20,
  },
  helperText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 10,
  },
});