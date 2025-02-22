import groq from 'groq'

export const getOnboardingConfig = groq`
  *[_type == "onboardingPage" && isEnabled == true][0] {
    name,
    isEnabled,
    "screens": selectedScreens[]-> {
      _id,
      title,
      description,
      "imageUrl": image.asset->url,
      isActive
    }
  }
` 