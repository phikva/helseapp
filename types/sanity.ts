export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

// Add more types based on your Sanity schema
export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: SanityImage;
  body: any[]; // You might want to type this more specifically based on your schema
} 