from recipe_scrapers import scrape_me, WebsiteNotImplementedError
import os
import sys
import unicodedata
import re

# Suppress warnings from the recipe-scrapers library
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Dictionary for specific character replacements
special_char_replacements = {
    '\u2044': '/',  # Fraction slash
    '\u2012': '-',  # Figure dash
    '\u2013': '-',  # En dash
    '\u2014': '-',  # Em dash
    '\u00bd': '1/2',  # One-half
    '\u00bc': '1/4',  # One-fourth
    '\u00be': '3/4',  # Three-fourths
    '\u2153': '1/3',  # One-third
    '\u2154': '2/3',  # Two-thirds
    '\u215b': '1/8',  # One-eighth
    # Add more replacements as needed
}

def clean_ingredient(ingredient):
    # Normalize Unicode characters using a manual mapping
    for unicode_char, replacement in special_char_replacements.items():
        ingredient = ingredient.replace(unicode_char, replacement)

    # Further cleaning if needed
    cleaned = re.sub(r'\([^)]*\)', '', ingredient)
    cleaned = cleaned.replace(")", "")
    cleaned = cleaned.replace(",","")
    return cleaned.strip()

def extract_ingredients(url):
    try:
        scraper = scrape_me(url)
    except WebsiteNotImplementedError:
        try:
            scraper = scrape_me(url, wild_mode=True)
        except Exception as e:
            return None, f"Failed to extract ingredients from {url}."
    ingredients = scraper.ingredients()
    cleaned_ingredients = [clean_ingredient(ing) for ing in ingredients]
    return f"Recipe URL: {url}\nIngredients:\n" + '\n'.join(cleaned_ingredients) + "\n\n", None

def save_ingredients_to_file(urls, output_file_path):
    all_ingredients_text = ""
    failed_urls = []
    for url in urls:
        result, error = extract_ingredients(url)
        if result:
            all_ingredients_text += result
        else:
            failed_urls.append(url)
    with open(output_file_path, 'w') as f:
        f.write(all_ingredients_text)
    print(f"Ingredients saved to {output_file_path}")
    return failed_urls

if __name__ == "__main__":
    urls = sys.argv[1:]  # Read URLs from command line arguments
    output_file_path = '/Users/wendyham/Desktop/Everything/Expeditr/URL-to-final-ingredients/ingredients_list.txt'
    failed_urls = save_ingredients_to_file(urls, output_file_path)
    if failed_urls:
        print("Failed to process the following URLs:")
        for url in failed_urls:
            print(url)
