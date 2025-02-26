import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityConfig } from '../config/env';

export const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  useCdn: sanityConfig.useCdn,
  apiVersion: sanityConfig.apiVersion,
});

// Helper function for generating image URLs
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Add a default export with the client and urlFor function
const sanityUtils = {
  client,
  urlFor,
};

export default sanityUtils; 