import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { sanityConfig } from '@/config/env';

export const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  useCdn: sanityConfig.useCdn,
  apiVersion: sanityConfig.apiVersion,
});

// Helper function for generating image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => {
  return builder.image(source);
}; 