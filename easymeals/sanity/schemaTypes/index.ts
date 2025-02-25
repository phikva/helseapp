import kategori from './kategori'
import oppskrift from './oppskrift'
import tier from './tier'
import { onboardingScreenSchema, onboardingPageSchema } from './onboarding'
import { pageSchema } from './page'
import { sectionSchema } from './section'
import brukerprofil from './brukerprofil'

export const schemaTypes = [
  // Core content types
  brukerprofil,
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
