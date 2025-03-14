interface Ingredient {
  name: string;
  measurement: {
    unit: string;
    unitQuantity: number;
  };
  mengde: string;
  kcal: number;
  makros: {
    protein: number;
    karbs: number;
    fett: number;
  };
  kommentar?: string;
}

interface Recipe {
  _type: string;
  tittel: string;
  porsjoner: number;
  ingrediens: Ingredient[];
  instruksjoner: string[];
  notater?: string;
  totalKcal: number;
  totalMakros: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

/**
 * Adjusts ingredient quantities based on the selected number of portions
 * @param recipe The original recipe
 * @param newPortions The new number of portions
 * @returns A new recipe object with adjusted ingredient quantities
 */
export function adjustRecipeForPortions(recipe: Recipe, newPortions: number): Recipe {
  if (!recipe || !recipe.porsjoner || newPortions <= 0) {
    return recipe;
  }

  const portionRatio = newPortions / recipe.porsjoner;
  
  // Create a deep copy of the recipe to avoid mutating the original
  const adjustedRecipe = JSON.parse(JSON.stringify(recipe)) as Recipe;
  
  // Adjust ingredient quantities
  adjustedRecipe.ingrediens = recipe.ingrediens.map(ingredient => {
    const adjustedIngredient = { ...ingredient };
    
    // Adjust measurement quantity
    if (adjustedIngredient.measurement && adjustedIngredient.measurement.unitQuantity) {
      adjustedIngredient.measurement = {
        ...adjustedIngredient.measurement,
        unitQuantity: roundToTwoDecimals(adjustedIngredient.measurement.unitQuantity * portionRatio)
      };
    }
    
    // Adjust calories and macros
    adjustedIngredient.kcal = roundToTwoDecimals(adjustedIngredient.kcal * portionRatio);
    
    if (adjustedIngredient.makros) {
      adjustedIngredient.makros = {
        protein: roundToTwoDecimals(adjustedIngredient.makros.protein * portionRatio),
        karbs: roundToTwoDecimals(adjustedIngredient.makros.karbs * portionRatio),
        fett: roundToTwoDecimals(adjustedIngredient.makros.fett * portionRatio)
      };
    }
    
    return adjustedIngredient;
  });
  
  // Adjust total calories and macros
  adjustedRecipe.totalKcal = roundToTwoDecimals(recipe.totalKcal * portionRatio);
  
  if (adjustedRecipe.totalMakros) {
    adjustedRecipe.totalMakros = {
      protein: roundToTwoDecimals(recipe.totalMakros.protein * portionRatio),
      karbs: roundToTwoDecimals(recipe.totalMakros.karbs * portionRatio),
      fett: roundToTwoDecimals(recipe.totalMakros.fett * portionRatio)
    };
  }
  
  // Update the portions count
  adjustedRecipe.porsjoner = newPortions;
  
  return adjustedRecipe;
}

/**
 * Rounds a number to two decimal places
 */
function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats an ingredient quantity for display
 * @param ingredient The ingredient to format
 * @returns A formatted string representation of the ingredient quantity
 */
export function formatIngredientQuantity(ingredient: Ingredient): string {
  if (!ingredient.measurement || !ingredient.measurement.unitQuantity) {
    return ingredient.mengde || '';
  }
  
  const { unit, unitQuantity } = ingredient.measurement;
  
  // Format the quantity based on the unit
  switch (unit.toLowerCase()) {
    case 'gram':
    case 'g':
      return `${unitQuantity}g`;
    case 'kg':
      return `${unitQuantity}kg`;
    case 'liter':
    case 'l':
      return `${unitQuantity}L`;
    case 'dl':
      return `${unitQuantity}dl`;
    case 'ss':
      return `${unitQuantity} ss`;
    case 'ts':
      return `${unitQuantity} ts`;
    case 'stk':
      return `${unitQuantity} stk`;
    default:
      return `${unitQuantity} ${unit}`;
  }
} 