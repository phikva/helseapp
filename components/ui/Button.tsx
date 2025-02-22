import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { buttonStyles } from '../../lib/theme';
import { ArrowRightIcon } from '../Icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'transparent';
  children: string;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className,
  ...props 
}: ButtonProps) {
  const styles = buttonStyles[variant];
  const textColor = variant === 'secondary' ? 'white' : 'black';

  return (
    <TouchableOpacity
      className={`${styles.base} ${className || ''}`}
      {...props}
    >
      <Text className={styles.text}>
        {children}
      </Text>
      <ArrowRightIcon size={20} color={textColor} />
    </TouchableOpacity>
  );
} 