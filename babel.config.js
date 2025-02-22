module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
      'nativewind/babel',
      ['module-resolver', {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './app',
          '@components': './components',
          '@lib': './lib',
          '@constants': './app/constants',
          '@store': './lib/store',
          '@config': './config',
          '@hooks': './hooks',
          '@assets': './assets'
        },
      }],
    ],
  };
}; 