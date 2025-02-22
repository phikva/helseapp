import { Text } from 'react-native';

interface IconSymbolProps {
  name: 'checkmark.circle.fill' | 'xmark.circle.fill' | 'info.circle.fill' | 'person.fill' | 'chevron.right' | 'arrow.right';
  size?: number;
  color?: string;
}

export function IconSymbol({ name, size = 24, color = '#000' }: IconSymbolProps) {
  const getSymbol = () => {
    switch (name) {
      case 'checkmark.circle.fill':
        return '✓';
      case 'xmark.circle.fill':
        return '✕';
      case 'info.circle.fill':
        return 'ℹ';
      case 'person.fill':
        return '👤';
      case 'chevron.right':
        return '›';
      case 'arrow.right':
        return '→';
      default:
        return '•';
    }
  };

  return (
    <Text style={{ fontSize: size, color, lineHeight: size }}>
      {getSymbol()}
    </Text>
  );
} 