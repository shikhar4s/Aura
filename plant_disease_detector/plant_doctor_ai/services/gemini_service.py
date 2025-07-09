# plant_doctor_ai/services/gemini_service.py
import os
import google.generativeai as genai
import json

CHATBOT_SYSTEM_PROMPT = """
You are "PlantDoc Assistant," an AI specialized in plant health, diseases, and treatments.
Your purpose is strictly limited to assisting users of the Plant Disease Detection platform.

YOUR SCOPE:
1. Discussing plant diseases (symptoms, causes).
2. Providing treatment advice (organic and chemical).
3. Offering prevention tips and general plant care advice (watering, soil, light).
4. Answering questions about the Plant Disease Detection platform itself (e.g., "How do I upload a photo?", "Where can I see my history?").
5. User may ask you to generate response in the following supported language as well, if so then you must give the responses in those languages, here are some code that you might want to look into when user asks to or mentioned in the prompt.
    [ code: 'en', name: 'English', flag: '🇺🇸' ],
    [ code: 'hi', name: 'हिंदी', flag: '🇮🇳' ],
    [ code: 'es', name: 'Español', flag: '🇪🇸' ],
    [ code: 'fr', name: 'Français', flag: '🇫🇷' ]

GUARDRAILS (IMPORTANT):
- If a user asks a question outside of the SCOPE defined above (e.g., math, history, politics, general knowledge, jokes), you MUST politely decline and state that you can only assist with plant health and platform-related inquiries.
- Do NOT answer questions unrelated to plants or the platform.

TONE:
- Professional, helpful, and encouraging.
"""

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'models/gemini-2.5-pro',
            system_instruction=CHATBOT_SYSTEM_PROMPT
        )
        self.structured_model = genai.GenerativeModel('models/gemini-2.5-pro')
        print("✅ Gemini Service initialized.")

    def get_treatment_info(self, disease_name, language='en'):
        prompt = f"""
        You are an expert botanist and plant pathologist named PlantDoc.
        A plant has been diagnosed with: "{disease_name}".

        Provide a concise response in JSON format with two keys:
        1. "recommended_treatment": A paragraph describing practical, actionable treatment steps. Mention common solutions like neem oil, baking soda, or specific fungicides if applicable.
        2. "prevention_tips": A list of 3-4 bullet points on how to prevent this disease in the future.

        Example for "Powdery Mildew":
        {{
            "recommended_treatment": "Spray with a solution of neem oil or potassium bicarbonate (baking soda). Ensure good air circulation by pruning dense foliage and avoid overhead watering to keep leaves dry. For severe infections, a commercial fungicide may be necessary.",
            "prevention_tips": [
                "Maintain proper air circulation around plants.",
                "Avoid overcrowding plants to reduce humidity.",
                "Water at the soil level, not on the leaves.",
                "Choose disease-resistant plant varieties when possible."
            ]
        }}

        Now, generate the response for "{disease_name}".

        Here are few codes that i want you to check:
            [ code: 'en', name: 'English', flag: '🇺🇸' ],
            [ code: 'hi', name: 'हिंदी', flag: '🇮🇳' ],
            [ code: 'es', name: 'Español', flag: '🇪🇸' ],
            [ code: 'fr', name: 'Français', flag: '🇫🇷' ]

        And You have to generate the response in {language}.
        """

        try:
            response = self.structured_model.generate_content(prompt)
            cleaned_text = response.text.strip().replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"Error calling Gemini API for treatment info: {e}")
            return {
                "recommended_treatment": "Could not retrieve treatment information at this time. Please consult a local gardening expert.",
                "prevention_tips": ["Ensure your plant has adequate light, water, and nutrients to build its natural defenses."]
            }

    def process_chat(self, history, new_message, language='en'):
        try:
            chat = self.model.start_chat(history=history)
            response = chat.send_message(new_message + f"You have to give the response in language {language}")
            return response.text.strip()
        except Exception as e:
            print(f"Error during Gemini chat processing: {e}")
            return "I'm sorry, I encountered an error. Please try asking again later."

gemini_service = GeminiService()