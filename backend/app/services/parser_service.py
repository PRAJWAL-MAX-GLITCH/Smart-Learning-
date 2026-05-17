import pandas as pd
import docx
import pdfplumber
import re
import io

class ParserService:
    @staticmethod
    def parse_csv_excel(file_content, file_extension):
        """Parse CSV or XLSX using Pandas"""
        try:
            if file_extension == '.csv':
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                df = pd.read_excel(io.BytesIO(file_content))
            
            # Map column names (handle variations)
            df.columns = [c.lower().strip().replace(' ', '_') for c in df.columns]
            
            questions = []
            for _, row in df.iterrows():
                questions.append({
                    "question_text": str(row.get('question', row.get('question_text', ''))),
                    "option_a": str(row.get('option1', row.get('option_a', ''))),
                    "option_b": str(row.get('option2', row.get('option_b', ''))),
                    "option_c": str(row.get('option3', row.get('option_c', ''))),
                    "option_d": str(row.get('option4', row.get('option_d', ''))),
                    "correct_answer": str(row.get('correct_answer', row.get('answer', ''))).strip().upper()[:1],
                    "difficulty": str(row.get('difficulty', 'medium')).lower(),
                    "explanation": str(row.get('explanation', '')),
                    "marks": int(row.get('marks', 1))
                })
            return questions
        except Exception as e:
            raise ValueError(f"Failed to parse spreadsheet: {str(e)}")

    @staticmethod
    def parse_text_based(text):
        """Generic MCQ extractor for PDF and Word"""
        # Patterns for questions and options
        # Supports: Q1., 1., (1) etc.
        q_pattern = r'(?i)(?:^|\n)(?:Q)?(?:uastion)?\s*(\d+)[.)]\s*(.*?)(?=\n\s*[A-Da-d][.)]|\n\s*(?:Q)?\d+[.)]|$)'
        # Supports: A., a), (A) etc.
        o_pattern = r'(?i)\s*([A-D])[.)]\s*(.*?)(?=\n\s*[A-D][.)]|\n\s*(?:Answer|Correct|Ans):|$)'
        # Supports: Answer: B, Correct: a, Ans: C
        a_pattern = r'(?i)(?:Answer|Correct|Ans|Correct Answer)\s*[:.-]?\s*([A-D])'

        raw_blocks = re.split(r'(?i)\n\s*(?:Q)?(?:\d+)[.)]', text)
        if len(raw_blocks) <= 1:
            # Try splitting by just number at start of line
            raw_blocks = re.split(r'\n\s*\d+[.)]', text)

        parsed_questions = []
        
        for block in raw_blocks:
            if not block.strip(): continue
            
            # Extract Question Text
            q_match = re.search(r'^(.*?)(?=\n\s*[A-D][.)]|$)', block, re.DOTALL)
            q_text = q_match.group(1).strip() if q_match else block.strip()
            
            # Extract Options
            options = {}
            for o_match in re.finditer(o_pattern, block):
                label = o_match.group(1).upper()
                options[label] = o_match.group(2).strip()
            
            # Extract Answer
            ans_match = re.search(a_pattern, block)
            correct_ans = ans_match.group(1).upper() if ans_match else ""

            if q_text and len(options) >= 2:
                parsed_questions.append({
                    "question_text": q_text,
                    "option_a": options.get('A', ''),
                    "option_b": options.get('B', ''),
                    "option_c": options.get('C', ''),
                    "option_d": options.get('D', ''),
                    "correct_answer": correct_ans,
                    "difficulty": "medium",
                    "explanation": "",
                    "marks": 1
                })
        
        return parsed_questions

    @staticmethod
    def parse_docx(file_content):
        """Parse Word Document"""
        doc = docx.Document(io.BytesIO(file_content))
        full_text = "\n".join([para.text for para in doc.paragraphs])
        return ParserService.parse_text_based(full_text)

    @staticmethod
    def parse_pdf(file_content):
        """Parse PDF Document"""
        full_text = ""
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"
        return ParserService.parse_text_based(full_text)
