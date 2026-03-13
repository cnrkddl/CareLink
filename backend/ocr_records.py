import os
import re
import json
import base64
import io
import pdfplumber
from typing import Dict, List, Tuple, Optional
from pdf2image import convert_from_path
from PIL import Image
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ==============================
# Pydantic 출력 스키마
# ==============================
class NursingItem(BaseModel):
    keyword: str
    detail: str

class NursingNote(BaseModel):
    date: str
    items: List[NursingItem]

# ==============================
# 설정 파일 로드
# ==============================
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "symptoms_config.json")

def load_symptoms_config() -> dict:
    """symptoms_config.json 로드. 없으면 기본값 반환."""
    if os.path.exists(_CONFIG_PATH):
        with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "extract_symptoms": [],
        "exclude_patterns": [],
        "pii_patterns": []
    }

# ==============================
# Step 1: PII 비식별화
# ==============================
def deidentify_text(text: str) -> str:
    """
    개인식별정보(PII)를 [MASK]로 치환.
    주민등록번호, 전화번호, 생년월일, 병원 등록번호 등을 제거.
    """
    config = load_symptoms_config()
    pii_patterns = config.get("pii_patterns", [])

    # 설정 파일에 정의된 PII 패턴 마스킹
    for pattern in pii_patterns:
        text = re.sub(pattern, "[MASK]", text)

    # 기본 PII 패턴 (항상 적용)
    # 주민등록번호 (예: 350315-2xxxxxx)
    text = re.sub(r"\d{6}-[1-4]\d{6}", "[MASK]", text)
    # 전화번호 (예: 010-1234-5678)
    text = re.sub(r"\d{2,4}-\d{3,4}-\d{4}", "[MASK]", text)
    # 환자 등록번호 (예: 25-0000032)
    text = re.sub(r"\d{2}-\d{7}", "[ID]", text)

    return text

# ==============================
# Step 2: AI-powered OCR (Vision)
# ==============================

def encode_image(image: Image.Image) -> str:
    """PIL 이미지를 base64 문자열로 변환"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def extract_text_from_pdf(pdf_path: str) -> str:
    """PDF를 이미지로 변환 후 GPT-4o Vision을 사용하여 텍스트 추출 (Real OCR)"""
    try:
        print(f"[OCR] PDF 변환 시작: {pdf_path}")
        # PDF의 모든 페이지를 이미지로 변환 (메모리 절약을 위해 저해상도 150 DPI)
        images = convert_from_path(pdf_path, dpi=150)
        
        llm = ChatOpenAI(model="gpt-4o-mini")
        full_text = ""
        
        for i, img in enumerate(images):
            print(f"[OCR] 페이지 {i+1}/{len(images)} 처리 중...")
            base64_image = encode_image(img)
            
            message = HumanMessage(
                content=[
                    {"type": "text", "text": "이 이미지(간호기록지)에 포함린 모든 텍스트를 가능한 정확하게 추출해서 텍스트로만 반환해줘. 추가 설명은 하지 마."},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ]
            )
            
            response = llm.invoke([message])
            full_text += response.content + "\n"
        
        print("[OCR] 모든 페이지 추출 완료")
        return full_text
    except Exception as e:
        print(f"[OCR] Vision OCR 실패, 기존 pdfplumber로 시도: {e}")
        # Fallback: 기존 정적 텍스트 추출
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

# ==============================
# Step 3: LLM 기반 파싱
# ==============================
def parse_nursing_notes_with_llm(text: str) -> List[dict]:
    """
    비식별화된 간호기록 텍스트를 GPT-4o-mini로 분석하여
    날짜별 특이사항을 JSON으로 추출.
    """
    config = load_symptoms_config()
    symptoms_hint = ", ".join(config.get("extract_symptoms", []))
    exclude_hint = ", ".join(config.get("exclude_patterns", []))

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_template(
        """당신은 의료 간호기록 분석 전문가입니다.
아래 간호기록 텍스트를 읽고, 날짜별로 특이사항(증상, 처치, 변화)을 추출하여 JSON 배열로 반환하세요.

[추출 참고 증상 키워드]
{symptoms_hint}

[제외 항목 - 일상 케어이므로 제외]
{exclude_hint}

[출력 형식 - 반드시 이 형식의 JSON만 반환, 설명 없음]
[
  {{
    "date": "YYYY-MM-DD",
    "items": [
      {{"keyword": "특이사항 키워드", "detail": "구체적인 내용 또는 처치"}}
    ]
  }}
]

[규칙]
- 날짜가 없는 기록은 무시
- 특이사항이 없는 날짜는 items를 빈 배열로
- 호전된 경우 detail에 "호전됨" 명시
- 반드시 JSON만 반환 (마크다운 코드블록 없이)

[간호기록 텍스트]
{text}
"""
    )

    chain = prompt | llm | parser

    # 텍스트가 너무 길면 앞 4000자만 사용 (토큰 절약)
    trimmed_text = text[:4000] if len(text) > 4000 else text

    result = chain.invoke({
        "symptoms_hint": symptoms_hint or "수면, 배뇨, 식사, 통증, 낙상, 욕창",
        "exclude_hint": exclude_hint or "욕창 예방, 낙상방지",
        "text": trimmed_text
    })

    return result if isinstance(result, list) else []


# ==============================
# Fallback: 기존 정규식 파싱
# ==============================

# 하드코딩된 정규식은 fallback 전용으로 유지
_SYMPTOM_REGEXES: Dict[str, re.Pattern] = {
    "자가배뇨": re.compile(r"자가\s*배뇨"),
    "수면장애": re.compile(r"수면"),
    "욕창": re.compile(r"욕창"),
    "변조절": re.compile(r"(대\s*소\s*변\s*조절|대\s*변\s*조절|변\s*조절)"),
    "변을 못봄": re.compile(r"변(?:을)?\s*못봄"),
    "파킨슨 증상악화": re.compile(r"파킨슨\s*증상.*(심해|악화)"),
}

_EXCLUDE_REGEXES = [
    re.compile(r"욕창.*예방"),
    re.compile(r"낙상방지")
]

def _is_block_start(line: str) -> bool:
    if line.startswith("*") or line.startswith("-"):
        return True
    return any(p.search(line) for p in _SYMPTOM_REGEXES.values())

def _parse_by_date_regex(text: str) -> Dict[str, List[Tuple[str, str]]]:
    """기존 정규식 기반 파싱 (LLM 실패 시 fallback)"""
    records: Dict[str, List[Tuple[str, str]]] = {}
    current_date: Optional[str] = None
    buffer: List[str] = []

    def flush_buffer():
        nonlocal buffer
        if buffer and current_date:
            block = " ".join(buffer)
            if any(rx.search(block) for rx in _EXCLUDE_REGEXES):
                buffer = []
                return
            found_labels = set()
            for label, pat in _SYMPTOM_REGEXES.items():
                if pat.search(block):
                    found_labels.add(label)
            if found_labels:
                existing_labels = {kw for kw, _ in records.get(current_date, [])}
                for label in found_labels - existing_labels:
                    records[current_date].append((label, block))
        buffer = []

    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if (not line
                or "효림요양병원" in line
                or "Page No" in line
                or "Nurse Record" in line):
            continue
        m = re.match(r"#\s*(\d{4}-\d{2}-\d{2})", line)
        if m:
            flush_buffer()
            current_date = m.group(1)
            records.setdefault(current_date, [])
            continue
        if current_date and _is_block_start(line):
            flush_buffer()
            buffer = [line]
        elif buffer:
            buffer.append(line)

    flush_buffer()
    return records

def _regex_records_to_json(records: Dict[str, List[Tuple[str, str]]]) -> List[dict]:
    """정규식 파싱 결과를 LLM 출력과 동일한 JSON 구조로 변환"""
    notes = []
    for date in sorted(records.keys()):
        items = [{"keyword": kw, "detail": cause} for kw, cause in records[date]]
        notes.append({"date": date, "items": items})
    return notes

# ==============================
# 메인 공개 함수
# ==============================
def build_nursing_notes_json(pdf_path: str) -> List[dict]:
    """
    PDF → 텍스트 추출 → PII 비식별화 → LLM 파싱 → JSON 반환.
    LLM 실패 시 정규식 fallback 자동 적용.
    """
    raw_text = extract_text_from_pdf(pdf_path)
    clean_text = deidentify_text(raw_text)

    try:
        result = parse_nursing_notes_with_llm(clean_text)
        if result:
            return result
    except Exception as e:
        print(f"[ocr_records] LLM 파싱 실패, fallback 사용: {e}")

    # Fallback: 정규식 파싱
    records = _parse_by_date_regex(raw_text)
    return _regex_records_to_json(records)


def parse_by_date(text: str) -> Dict[str, List[Tuple[str, str]]]:
    """하위 호환성 유지용 (main.py의 by_date 응답에서 사용)"""
    return _parse_by_date_regex(text)


def compare_changes_with_text(records: Dict[str, List[Tuple[str, str]]]) -> str:
    """날짜별 변화 비교 (기존 기능 유지)"""
    output_lines: List[str] = []
    dates = sorted(records.keys())
    for i, date in enumerate(dates):
        output_lines.append(f"=== {date} ===")
        current_items = list(records[date])
        if i > 0:
            prev_labels = {kw for kw, _ in records[dates[i - 1]]}
            curr_labels = {kw for kw, _ in records[date]}
            for kw in sorted(prev_labels - curr_labels):
                current_items.append((kw, "호전됨"))
        for kw, cause in current_items:
            output_lines.append(f"- 특이사항 : {kw} / {cause}")
        output_lines.append("")
    return "\n".join(output_lines)