export const sanityConfig = {
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.EXPO_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: true,
}; 