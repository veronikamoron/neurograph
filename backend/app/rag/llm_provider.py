import google.generativeai as genai
from typing import List, Tuple
from app.graph.entity_extractor import EntityExtractor

class GeminiProvider:
    def generate(self, prompt: str, api_key: str, model: str = 'gemini-2.0-flash') -> str:
        genai.configure(api_key=api_key)
        gen_model = genai.GenerativeModel(model)
        response = gen_model.generate_content(prompt)
        return response.text

    def extract_entities(self, text: str, api_key: str) -> List[Tuple[str, str, str]]:
        extractor = EntityExtractor()
        return extractor.extract_from_text(text, api_key)
