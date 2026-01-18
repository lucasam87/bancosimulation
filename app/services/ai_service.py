import google.generativeai as genai
import os
import json
from decimal import Decimal

# Configure Gemini
# Note: User should provide GEMINI_API_KEY in environment variables
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def analyze_credit_with_ai(age: int, mother_name: str, monthly_income: Decimal, assets_value: Decimal):
    if not API_KEY:
        # Mock behavior if API Key is not set
        if monthly_income > 2000:
            limit = float(monthly_income) * 0.4
            return {
                "status": "approved",
                "ai_feedback": "Baseado na sua renda e perfil, aprovamos um crédito inicial de R$" + f"{limit:.2f}",
                "approved_limit": limit
            }
        else:
            return {
                "status": "rejected",
                "ai_feedback": "Infelizmente no momento não conseguimos liberar crédito para o seu perfil de renda.",
                "approved_limit": 0
            }

    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    Atue como um analista de crédito sênior de um banco digital. 
    Analise os seguintes dados do cliente para decidir se ele deve receber um limite de crédito e um cartão de crédito:
    - Idade: {age}
    - Renda Mensal: R$ {monthly_income}
    - Valor de Bens/Patrimônio: R$ {assets_value}
    
    Regras de negócio:
    1. Se a renda for menor que R$ 1000, o score deve ser baixo e o status rejeitado.
    2. Calcule um Score de Crédito de 0 a 1000 com base no perfil (Renda, Bens, Idade).
    3. O limite aprovado deve ser entre 20% e 50% da renda mensal, dependendo da idade e bens.
    4. Seja educado e profissional no feedback. Mencione se o cliente é elegível para o nosso cartão de crédito exclusive.
    
    Responda APENAS em formato JSON com os campos: 
    "status" (approved ou rejected), 
    "ai_feedback" (texto explicativo em português),
    "approved_limit" (número flutuante),
    "score" (inteiro de 0 a 1000).
    """

    try:
        response = model.generate_content(prompt)
        # Clean response text in case it contains markdown code blocks
        text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        return result
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        # Fallback to simple logic
        if monthly_income > 1500:
            return {
                "status": "approved", 
                "ai_feedback": "Crédito aprovado com base na sua renda (Modo Offline).", 
                "approved_limit": float(monthly_income) * 0.3,
                "score": 750 # Mock score for offline mode
            }
        return {
            "status": "rejected", 
            "ai_feedback": "Crédito não aprovado no momento (Modo Offline).", 
            "approved_limit": 0,
            "score": 300
        }
