import kategori from './kategori'
import oppskrift from './oppskrift'
import tier from './tier'
import { onboardingScreenSchema, onboardingPageSchema } from './onboarding'
import { pageSchema } from './page'
import { sectionSchema } from './section'

export const schemaTypes = [
  // Core content types
  oppskrift,
  kategori,
  tier,
  
  // Page structure
  pageSchema,
  sectionSchema,
  
  // Onboarding
  onboardingScreenSchema,
  onboardingPageSchema,
]
