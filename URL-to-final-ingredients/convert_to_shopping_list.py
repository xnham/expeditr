import os
import csv
from anthropic import Anthropic, CLAUDE_3_OPUS_20240229

def send_to_claude(ingredient_list):
    # Create a client instance
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    # Prepare the prompt
    prompt_text = (
        "Please organize the ingredient list below into a comma-separated shopping list. "
        "The columns are: ingredient name, quantity, unit, category, and recipe URL. "
        "For example: tomato, 2, lbs, Vegetables, https://cooking.nytimes.com/recipes/1023371-sheet-pan-feta-with-chickpeas-and-tomatoes OR salt, 1, tsp, Pantry, https://cooking.nytimes.com/recipes/1023371-sheet-pan-feta-with-chickpeas-and-tomatoes OR firm tofu, 1, block, Dairy, https://cooking.nytimes.com/recipes/1016016-soba-noodles-with-shiitakes-broccoli-and-tofu "
        "For 'category', assign each ingredient to one of these categories: Produce, Meat/Poultry, Seafood, Dairy, Other, Pantry.\n"
        "Keep a few things in mind:\n"
        "- Since you are creating a shopping list for shopping (not for cooking), make sure to remove any cooking prep details, such as 'chopped', 'rinsed', 'cooked', 'cubed', 'patted dry', 'smashed', 'cut crosswise', and other similar details.\n"
        "- If you see the same ingredient listed multiple times, please add up the quantity."
        "- Avoid using commas within an ingredient name, quantity, unit, or category."
        "- Avoid punctuations in general."
        "- Do not add a comma at the end of each category."
        "- If an ingredient comes from multiple recipe URLs, please separate the recipe URLs with a semicolon."
        "- When you see something like this 'Any combination of fresh herbs, such as basil, parsley, sage or oregano', notice that the word 'or' indicates options, so simply list the ingredient name the way it is written, i.e., 'Any combination of fresh herbs, such as basil, parsley, sage or oregano'." 
        "- However, please also notice that when you see something like: 'Any combination of anchovies capers tuna black olives garlic and tomatoes', notice that the word 'and' means all the ingredients are necessary, so you can break it down into individual ingredients, which in this example are: anchovies, capers, tuna, black olives, garlic, and tomatoes. Each of these ingredients should get its own row."
        "- If you see a fraction (e.g., 1/2), convert it to a decimal (e.g., 0.5)."
        "- If the quantity is not specified, say 'to taste' for the quantity and 'n/a' for the unit."
        "- In general, if the unit is unclear, say 'n/a'."
        "- If you see a unicode character (e.g., 'u2152'), normalize it."
        f"Here is the ingredient list:\n{ingredient_list}"
    )

    # Send the request to Claude
    response = client.messages.create(
        model=CLAUDE_3_OPUS_20240229,
        max_tokens=1000,
        messages=[
            {"role": "user", "content": prompt_text}
        ]
    )

    # Retrieve the completion
    shopping_list = response.content[0].text.strip()
    return shopping_list

def save_shopping_list_to_csv(shopping_list, filename):
    # Split the shopping list into rows based on new lines
    rows = shopping_list.split('\n')
    
    # Open a file in write mode
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        
        # Define and write the header row
        headers = ['ingredient_name', 'quantity', 'unit', 'category']
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
