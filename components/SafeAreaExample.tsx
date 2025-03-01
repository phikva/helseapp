import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeArea from './SafeArea';

/**
 * Example component demonstrating how to use the SafeArea component
 */
export default function SafeAreaExample() {
  return (
    <SafeArea 
      backgroundColor="#f5f5f5"
      edges={['top', 'bottom']} // Only apply safe area to top and bottom
    >
      <View style={styles.container}>
        <Text style={styles.title}>SafeArea Example</Text>
        <Text style={styles.description}>
          This component is wrapped in a SafeArea that handles platform differences
          between iOS and Android automatically.
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Features:</Text>
          <Text style={styles.infoItem}>• Handles iOS notches and home indicators</Text>
          <Text style={styles.infoItem}>• Properly manages Android status bar</Text>
          <Text style={styles.infoItem}>• Adapts to light/dark mode</Text>
          <Text style={styles.infoItem}>• Customizable edges (top, right, bottom, left)</Text>
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
}); 