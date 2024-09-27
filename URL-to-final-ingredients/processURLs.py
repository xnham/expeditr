from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import csv
import re
import requests
from bs4 import BeautifulSoup
from extract_initial_ingredients import save_ingredients_to_file
from convert_to_shopping_list import send_to_chatgpt

app = Flask(__name__)
CORS(app)

def parse_chatgpt_response(chatgpt_response):
    ingredients = []
    lines = chatgpt_response.strip().split('\n')  # Split response into lines
    for line in lines:
        parts = line.split(', ')
        if len(parts) < 5:
            continue  # Skip if there are not enough parts to form a complete ingredient entry

        name = parts[0].strip()
        quantity = parts[1].strip()
        unit = parts[2].strip()
        category = parts[3].strip()
        urls = parts[4].strip()

        # Split URLs if multiple, separated by spaces or semicolons
        urls = [url.strip() for url in re.split(r'[; ]+', urls) if url.strip().startswith('http')]

        ingredients.append({
            'name': name,
            'quantity': quantity,
            'unit': unit,
            'category': category,
            'urls': urls
        })
    return ingredients

def get_title(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            title = soup.find('title').text
            return title.strip()
    except requests.RequestException as e:
        print(f"Error fetching title from {url}: {str(e)}")
        return "No Title Found"

@app.route('/scrape-and-extract', methods=['POST'])
def scrape_and_extract():
    try:
        urls = request.json['urls']
        print("Received URLs:", urls)

        # Save ingredients to a text file and extract them
        text_output_path = '/Users/wendyham/Desktop/Everything/Expeditr/URL-to-final-ingredients/ingredients_list.txt'
        failed_urls = save_ingredients_to_file(urls, text_output_path)
        print("Failed URLs:", failed_urls)

        # Convert ingredients list to shopping list using ChatGPT
        with open(text_output_path, 'r') as file:
            ingredient_list = file.read()
        chatgpt_response = send_to_chatgpt(ingredient_list)
        print("ChatGPT Response:", chatgpt_response)

        # Parse the ChatGPT response
        shopping_list = parse_chatgpt_response(chatgpt_response)

        # Fetch titles for each URL in the shopping list items
        for item in shopping_list:
            titles = [get_title(url) for url in item['urls']]
            item['titles'] = titles  # Assign the titles to each item

        # Send the structured response
        response = {
            'message': 'Ingredients extracted and shopping list created',
            'shoppingList': shopping_list,
            'failedUrls': failed_urls
        }
        print("Response being sent:", response)
        return jsonify(response), 200
    except Exception as e:
        print("Error during extraction:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
