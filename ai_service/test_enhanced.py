import fitz
import httpx
import asyncio
import os
import time

async def test_enhanced_capabilities():
    # 1. Create a PDF with a complex table and metadata
    pdf_path = "test_merit_list.pdf"
    doc = fitz.open()
    page = doc.new_page()
    
    # Add some header text with metadata
    page.insert_text((50, 50), "ADMISSION MERIT LIST 2025 - SECOND YEAR (SE) - DIV A")
    
    # Create a Markdown-like table in text
    table_text = """
    | Name | Roll No | Caste | Marks |
    | --- | --- | --- | --- |
    | Alice Smith | 201 | OPEN | 95 |
    | Bob Johnson | 202 | OBC | 92 |
    | Charlie Brown | 203 | SC | 88 |
    | David Wilson | 204 | ST | 85 |
    """
    page.insert_text((50, 100), table_text)
    doc.save(pdf_path)
    print(f"Created test PDF: {pdf_path}")

    # 2. Ingest the document
    async with httpx.AsyncClient(timeout=30.0) as client:
        with open(pdf_path, 'rb') as f:
            files = {'file': (pdf_path, f, 'application/pdf')}
            print("Uploading document...")
            resp = await client.post("http://localhost:8000/ingest", files=files)
            print("Ingestion Response:", resp.json())

    # 3. Test Metadata-Aware Query
    queries = [
        "What are the marks of Charlie Brown?",
        "Show me the OBC merit list for SE Div A",
        "Who is in the ST category?"
    ]

    async with httpx.AsyncClient(timeout=30.0) as client:
        for q in queries:
            print(f"\nQuery: {q}")
            payload = {"text": q, "user_id": "test_user_123"}
            resp = await client.post("http://localhost:8000/chat", json=payload)
            result = resp.json()
            print("Response:", result["response"])
            print("Sources:", result["sources"])

    # Cleanup
    # os.remove(pdf_path)

if __name__ == "__main__":
    asyncio.run(test_enhanced_capabilities())
