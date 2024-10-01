from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import csv
import re
import requests
from bs4 import BeautifulSoup
from extract_initial_ingredients import save_ingredients_to_file
from convert_to_shopping_list import send_to_claude, save_shopping_list_to_csv
from anthropic import APIError

app = Flask(__name__)
CORS(app)

def parse_claude_response(claude_response):
    ingredients = []
    
    # Ensure claude_response is a list of strings
    if isinstance(claude_response, str):
        lines = claude_response.strip().split('\n')
    elif isinstance(claude_response, list):
        # If it's already a list, use it directly
        lines = claude_response
    else:
        raise ValueError(f"Unexpected response type from Claude: {type(claude_response)}")

    for line in lines:
        # Ensure each line is a string
        if not isinstance(line, str):
            continue  # Skip non-string items
        
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

@app.errorhandler(APIError)
def handle_anthropic_error(error):
    if error.status_code == 400 and "credit balance is too low" in str(error):
        return jsonify({"error": "Insufficient credits. Please contact the administrator."}), 402
    return jsonify({"error": "An error occurred with the AI service. Please try again later."}), 500

@app.route('/api/prepare-list', methods=['POST'])
def prepare_list():
    try:
        urls = request.json['urls']
        print("Received URLs:", urls)

        text_output_path = '/Users/wendyham/Desktop/Everything/Expeditr/URL-to-final-ingredients/ingredients_list.txt'
        failed_urls = save_ingredients_to_file(urls, text_output_path)

        with open(text_output_path, 'r') as file:
            ingredient_list = file.read()
        
        claude_response = send_to_claude(ingredient_list)
        
        print("Claude response type:", type(claude_response))
        print("Claude response content:", claude_response)

        shopping_list = parse_claude_response(claude_response)

        if not shopping_list:
            raise ValueError("Failed to parse Claude's response into a shopping list")

        # Fetch titles for each URL in the shopping list items
        for item in shopping_list:
            titles = [get_title(url) for url in item['urls']]
            item['titles'] = titles

        # Save the shopping list to a CSV file
        csv_filename = "shopping_list.csv"
        csv_path = os.path.join(os.path.dirname(text_output_path), csv_filename)
        save_shopping_list_to_csv(shopping_list, csv_path)

        response = {
            'message': 'Shopping list prepared successfully',
            'csvFile': csv_filename,
            'failedUrls': failed_urls
        }
        return jsonify(response), 200
    
    except APIError as e:
        # This will be caught by the error handler above
        raise
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

@app.route('/api/get-csv/<filename>', methods=['GET'])
def get_csv(filename):
    try:
        file_path = os.path.join('/Users/wendyham/Desktop/Everything/Expeditr/URL-to-final-ingredients', filename)
        print(f"Sending CSV file: {file_path}")
        return send_file(file_path, as_attachment=True, download_name=filename)
    except Exception as e:
        print("Error retrieving CSV file:", str(e))
        return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=3001)