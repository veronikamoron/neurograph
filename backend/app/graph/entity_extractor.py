import json
import google.generativeai as genai
from typing import List, Tuple

class EntityExtractor:
    def extract_from_text(self, text: str, api_key: str) -> List[Tuple[str, str, str]]:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f'''Extract knowledge graph triplets from the text.
Return ONLY a valid JSON array of arrays. Each inner array should have exactly 3 strings: [subject, relation, object].
Text: {text}
JSON:'''
        try:
            response = model.generate_content(prompt)
            content = response.text.strip()
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            data = json.loads(content)
            return [tuple(triplet) for triplet in data if len(triplet) == 3]
        except Exception as e:
            print(f"Error extracting entities: {e}")
            return []
