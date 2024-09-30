import os
import csv
from anthropic import Anthropic, CLAUDE_3_OPUS_20240229

def send_to_claude(ingredient_list):
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    prompt_text = """
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
        model=CLAUDE_3_OPUS_20240229,
        max_tokens=1000,
        messages=[
            {"role": "user", "content": prompt_text}
        ]
    )

    return response.content[0].text.strip()

def save_shopping_list_to_csv(shopping_list, filename):
    # Split the shopping list into rows based on new lines
    rows = shopping_list.split('\n')
    
    # Open a file in write mode
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        
        # Define and write the header row (added 'recipeLink' column)
        headers = ['ingredient_name', 'quantity', 'unit', 'category', 'recipeLink']
        writer.writerow(headers)
        
        # Write each row to the CSV file
        for row in rows:
            # Split each row into columns by comma
            writer.writerow(row.split(','))


# Example usage
if __name__ == "__main__":
    # Simulated ingredient list from a text file
    with open("ingredients_list.txt", "r") as file:
        ingredient_list = file.read()
    
    shopping_list = send_to_claude(ingredient_list)
    print("Generated Shopping List:\n", shopping_list)

    # Save the shopping list to a CSV file
    save_shopping_list_to_csv(shopping_list, "shopping_list.csv")
    print("Shopping list has been saved to 'shopping_list.csv'.")
