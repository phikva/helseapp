import { View } from 'react-native'
import { Svg, Path } from 'react-native-svg'

type IconProps = {
  size?: number
  color?: string
  strokeWidth?: number
}

export function ArrowRightIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M13.75 6.75L19.25 12L13.75 17.25"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 12H4.75"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

export function EnvelopeIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21.75 6.75V17.25C21.75 18.3546 20.8546 19.25 19.75 19.25H4.25C3.14543 19.25 2.25 18.3546 2.25 17.25V6.75M21.75 6.75C21.75 5.64543 20.8546 4.75 19.75 4.75H4.25C3.14543 4.75 2.25 5.64543 2.25 6.75M21.75 6.75L12 13.25L2.25 6.75"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

export function LockClosedIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M6.75 21.75H17.25C18.3546 21.75 19.25 20.8546 19.25 19.75V12.5C19.25 11.3954 18.3546 10.5 17.25 10.5H6.75C5.64543 10.5 4.75 11.3954 4.75 12.5V19.75C4.75 20.8546 5.64543 21.75 6.75 21.75Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

export function GoogleIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15.547 8.303A5.148 5.148 0 0012.115 7C9.504 7 7.4 9.105 7.4 11.715a4.715 4.715 0 004.715 4.715 4.923 4.923 0 003.275-1.21 4.487 4.487 0 001.314-3.208h-4.589V9.95h7.827c.082.452.124.915.124 1.381 0 2.428-.87 4.48-2.419 5.876A7.546 7.546 0 0112.115 19c-4.034 0-7.286-3.252-7.286-7.285A7.285 7.285 0 0112.115 4.43c2.043 0 3.885.82 5.215 2.15l-1.783 1.723z"
          fill={color}
        />
      </Svg>
    </View>
  )
}

export function AppleIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.006 1.46 2.207 3.095 3.794 3.039 1.52-.061 2.09-.986 3.926-.986 1.831 0 2.35.986 3.957.953 1.638-.027 2.677-1.485 3.677-2.948 1.159-1.697 1.637-3.337 1.664-3.423-.036-.013-3.192-1.226-3.224-4.857-.027-3.04 2.48-4.494 2.592-4.566-1.423-2.09-3.622-2.324-4.39-2.376-2-.156-3.675 1.09-4.594 1.09z"
          fill={color}
        />
        <Path
          d="M15.924 3.977c.832-1.004 1.392-2.402 1.24-3.797-1.197.048-2.647.798-3.506 1.802-.771.891-1.445 2.31-1.265 3.676 1.333.104 2.698-.677 3.531-1.681z"
          fill={color}
        />
      </Svg>
    </View>
  )
}

export function FacebookIcon({ size = 24, color = "black", strokeWidth = 1.5 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17 2H14C12.6739 2 11.4021 2.52678 10.4645 3.46447C9.52678 4.40215 9 5.67392 9 7V10H6V14H9V22H13V14H16L17 10H13V7C13 6.73478 13.1054 6.48043 13.2929 6.29289C13.4804 6.10536 13.7348 6 14 6H17V2Z"
          fill={color}
        />
      </Svg>
    </View>
  )
} 