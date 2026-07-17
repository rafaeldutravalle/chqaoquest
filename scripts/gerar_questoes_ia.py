import os
import json
from google import genai
from PyPDF2 import PdfReader
from docx import Document

# Configure the API Key manually or via environment variable
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBnCtm6RZ7aeSFE29dW9MVUwdQkUTlKtKU")
client = genai.Client(api_key=API_KEY)

def extract_text(file_path):
    print(f"Extraindo texto de {file_path}...")
    if file_path.endswith('.pdf'):
        reader = PdfReader(file_path)
        return " ".join(page.extract_text() for page in reader.pages if page.extract_text())
    elif file_path.endswith('.docx'):
        doc = Document(file_path)
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)
    return ""

def generate_questions_from_text(text, subject, existing=True):
    print(f"Gerando questões via Gemini para: {subject}...")
    
    max_chars = 40000 
    text_chunk = text[:max_chars] if text else ""
    
    prompt = f"""
    Você é um instrutor especialista do Exército Brasileiro, preparando sargentos para o CHQAO.
    Com base no seguinte texto da disciplina "{subject}", gere 5 questões de múltipla escolha.
    {"" if existing else "Como o texto não continha perguntas prontas, CRIE 5 questões inéditas focadas na disciplina."}
    
    Texto fonte:
    {text_chunk}
    
    As questões devem ser estritamente no seguinte formato JSON (array de objetos).
    O campo "alternativas" DEVE ser um array de objetos contendo "texto" (a alternativa) e "correta" (booleano):
    [
      {{
        "assunto": "{subject}",
        "enunciado": "Enunciado da pergunta",
        "alternativas": [
          {{"texto": "Opção incorreta 1", "correta": false}},
          {{"texto": "Opção correta", "correta": true}},
          {{"texto": "Opção incorreta 2", "correta": false}},
          {{"texto": "Opção incorreta 3", "correta": false}}
        ],
        "justificativa": "Explicação técnica embasada militarmente",
        "dificuldade": "Média",
        "ano": 2025
      }}
    ]
    Apenas retorne o JSON válido, sem markdown envolvente.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        content = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        print(f"Erro ao gerar questões: {e}")
        return []

def main():
    pasta_questoes = "../questoes"
    sql_statements = []
    
    diretorios = [
        ("História_Militar_Doutrin_Militar", "História"),
        ("português", "Português"),
        ("Geografia_Brasil", "Geografia"),
        ("CHQAO_musico", "Música"),
        ("Crimes_Militares_&_Sindicância", "Legislação"),
        ("E1", "Legislação"),
        ("Licitações_Contratos", "Legislação"),
        ("RAE", "Administração")
    ]
    
    for dir_name, category in diretorios:
        caminho_dir = os.path.join(pasta_questoes, dir_name)
        if not os.path.exists(caminho_dir):
            continue
            
        for file in os.listdir(caminho_dir):
            if file.endswith('.pdf') or file.endswith('.docx'):
                file_path = os.path.join(caminho_dir, file)
                text = extract_text(file_path)
                
                questions = generate_questions_from_text(text, category, existing=True)
                
                for q in questions:
                    # Garantir escape de aspas simples nas strings
                    enunciado = q['enunciado'].replace("'", "''")
                    justificativa = q.get('justificativa', '').replace("'", "''")
                    
                    # Converte o array de alternativas em uma string JSON formatada para SQL
                    alternativas_json = json.dumps(q['alternativas'], ensure_ascii=False).replace("'", "''")
                    
                    sql = f"""INSERT INTO public.questions_bank (assunto, enunciado, alternativas, justificativa, dificuldade, ano) VALUES ('{q['assunto']}', '{enunciado}', '{alternativas_json}'::jsonb, '{justificativa}', '{q.get('dificuldade', 'Média')}', {q.get('ano', 2025)});"""
                    sql_statements.append(sql)
                    
    with open('../supabase/tables/seed_questoes_geradas.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Concluído! {len(sql_statements)} questões foram geradas em seed_questoes_geradas.sql")

if __name__ == "__main__":
    main()
