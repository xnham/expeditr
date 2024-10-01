import os
import csv
from anthropic import Anthropic

def send_to_claude(ingredient_list):
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    # Ensure ingredient_list is a string
    if isinstance(ingredient_list, list):
        ingredient_list = "\n".join(ingredient_list)

    prompt_text = f"""
    Organize the given ingredient list into a comma-separated shopping list with these columns: 
    ingredient name, quantity, unit, category, recipe URL

    Rules:
    • Categories: Produce, Meat/Poultry, Seafood, Dairy, Other, Pantry
    • Remove cooking prep details (e.g., chopped, rinsed)
    • Combine duplicate ingredients, summing quantities
    • Convert fractions to decimals (e.g., 1/2 to 0.5)
    • Use 'to taste' for unspecified quantities, 'n/a' for unclear units
    • For ingredients with options (e.g., "basil or parsley"), list as is
    • For combined ingredients (e.g., "tomatoes and garlic"), list separately
    • Separate multiple recipe URLs with semicolons
    • Avoid commas within fields and extra punctuation

    Example output:
    tomato, 2, lbs, Produce, https://example.com/recipe1
    salt, 1, tsp, Pantry, https://example.com/recipe1;https://example.com/recipe2

    Ingredient list:
    {ingredient_list}

    Respond only with the formatted shopping list, no additional text.
    """

    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=3000,
        messages=[
            {"role": "user", "content": prompt_text}
        ]
    )

    # Extract the content from the response
    if isinstance(response.content, list) and len(response.content) > 0:
        # If it's a list of TextBlock objects, join their text
        return '\n'.join(block.text for block in response.content if hasattr(block, 'text'))
    elif isinstance(response.content, str):
        return response.content
    else:
        raise ValueError(f"Unexpected response format from Claude: {type(response.content)}")

def save_shopping_list_to_csv(shopping_list, filename):
    # Open a file in write mode
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        
        # Define and write the header row
        headers = ['ingredient_name', 'quantity', 'unit', 'category', 'recipeLink', 'titles']
        writer.writerow(headers)
        
        # Write each item to the CSV file
        for item in shopping_list:
            writer.writerow([
                item['name'],
                item['quantity'],
                item['unit'],
                item['category'],
                ';'.join(item['urls']),
                ';'.join(item.get('titles', []))
            ])

# Example usage
if __name__ == "__main__":
    # Simulated ingredient list from a text file
    with open("ingredients_list.txt", "r") as file:
        ingredient_list = file.read()
    
    print(f"API Key: {os.getenv('ANTHROPIC_API_KEY')}")

    shopping_list = send_to_claude(ingredient_list)
    print("Generated Shopping List:\n", shopping_list)

    # Save the shopping list to a CSV file
    save_shopping_list_to_csv(shopping_list, "shopping_list.csv")
    print("Shopping list has been saved to 'shopping_list.csv'.")
