'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/Button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/Card';
import {Input} from '@/components/ui/Input';
import {Textarea} from '@/components/ui/Textarea';
import {detectIngredients} from '@/ai/flows/detect-ingredients';
import {findRecipes} from '@/ai/flows/find-recipes';
import {adaptRecipe} from '@/ai/flows/adapt-recipe';
import {toast} from '@/hooks/use-toast';
import {useToast} from '@/hooks/use-toast';
import {Copy, Check} from 'lucide-react';
import {cn} from '@/lib/utils';

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<string[]>([]);
  const [adaptedRecipe, setAdaptedRecipe] = useState('');
  const [adaptingRecipe, setAdaptingRecipe] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const {toast} = useToast();
  const [copied, setCopied] = useState(false);

  const handleImageUpload = async () => {
    setIsImageUploaded(false);

    let photoData: string | undefined = undefined;
    let photoUrl: string | undefined = undefined;

    if (imageFile) {
      photoData = await readFileAsBase64(imageFile);
      photoUrl = undefined;
    } else if (imageUrl) {
      photoUrl = imageUrl;
      photoData = undefined;
    } else {
      toast({
        title: 'Error',
        description: 'Please enter an image URL or upload an image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const ingredientResult = await detectIngredients({photoUrl, photoData});
      setIngredients(ingredientResult.ingredients);
      setIsImageUploaded(true);
      toast({
        title: 'Ingredients Detected!',
        description: 'AI has identified the ingredients in the image.',
      });
    } catch (error: any) {
      console.error('Error detecting ingredients:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect ingredients. Please try again with a different image.',
        variant: 'destructive',
      });
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };


  const handleRecipeSearch = async () => {
    if (!ingredients.length) {
      toast({
        title: 'Error',
        description: 'No ingredients detected. Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const recipeResult = await findRecipes({ingredients});
      setRecipes(recipeResult.recipes);
      toast({
        title: 'Recipes Found!',
        description: 'AI has found recipes based on the detected ingredients.',
      });
    } catch (error: any) {
      console.error('Error finding recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to find recipes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAdaptRecipe = async () => {
    if (!recipes.length) {
      toast({
        title: 'Error',
        description: 'No recipes found. Please search for recipes first.',
        variant: 'destructive',
      });
      return;
    }

    if (!preferences) {
      toast({
        title: 'Error',
        description: 'Please enter your adaptation preferences.',
        variant: 'destructive',
      });
      return;
    }

    setAdaptingRecipe(true);
    try {
      const adaptationResult = await adaptRecipe({recipe: recipes[0], preferences});
      setAdaptedRecipe(adaptationResult.adaptedRecipe);
      toast({
        title: 'Recipe Adapted!',
        description: 'AI has adapted the recipe based on your preferences.',
      });
    } catch (error: any) {
      console.error('Error adapting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to adapt the recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAdaptingRecipe(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(adaptedRecipe).then(() => {
      setCopied(true);
      toast({
        description: 'Recipe copied to clipboard!',
      });
      setTimeout(() => {
        setCopied(false);
      }, 3000); // Reset copy state after 3 seconds
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">RecipeSnap</h1>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
          <CardDescription>Upload an image to detect ingredients.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
           <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setImageFile(e.target.files[0]);
                setImageUrl(''); // Clear URL when file is selected
              } else {
                  setImageFile(null);
              }
            }}
          />
          <Button onClick={handleImageUpload} disabled={(!imageUrl && !imageFile)}>Detect Ingredients</Button>
          {isImageUploaded && (
            <div className="flex justify-center">
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                alt="Uploaded Ingredient"
                className="max-h-48 object-contain rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Detected Ingredients</CardTitle>
          <CardDescription>Here are the ingredients detected in the image.</CardDescription>
        </CardHeader>
        <CardContent>
          {ingredients.length > 0 ? (
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No ingredients detected. Please upload an image.</p>
          )}
          <Button onClick={handleRecipeSearch} disabled={!ingredients.length}>Find Recipes</Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Recipe Options</CardTitle>
          <CardDescription>Here are some recipe options based on the detected ingredients.</CardDescription>
        </CardHeader>
        <CardContent>
          {recipes.length > 0 ? (
            <ul>
              {recipes.map((recipe, index) => (
                <li key={index} className="text-sm">{recipe}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No recipes found. Please detect ingredients and search for recipes.</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recipe Adaptation</CardTitle>
          <CardDescription>Adapt the recipe based on your preferences.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="Enter your adaptation preferences (e.g., dietary restrictions, serving size)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
          <Button onClick={handleAdaptRecipe} disabled={adaptingRecipe || !recipes.length}>
            {adaptingRecipe ? 'Adapting...' : 'Adapt Recipe'}
          </Button>
          {adaptedRecipe && (
            <div className="relative">
              <Textarea
                readOnly
                value={adaptedRecipe}
                className="resize-none"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
                disabled={copied}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

