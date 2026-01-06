import fitz  # PyMuPDF
import httpx
import asyncio
import os

async def main():
    # 1. Create a dummy PDF with secret info
    pdf_path = "campus_secrets.pdf"
    doc = fitz.open()
    page = doc.new_page()
    
    secret_text = """
    OFFICIAL CAMPUS SECRETS & MYSTERIES 2025
    
    1. The Golden Statue in the administrative block is actually made of hollow chocolate.
    2. The Dean's cat is named 'Professor Whiskers' and officially holds a PhD in Theoretical Napping.
    3. The secret WiFi password for the library basement is 'RainbowUnicorn2025'.
    4. The cafeteria serves free pizza only on February 30th every year.
    5. To summon the elevator, you must press the button exactly three times.
    """
    
    page.insert_text((50, 50), secret_text)
    doc.save(pdf_path)
    print(f"Created temporary file: {pdf_path}")

    # 2. Ingest via the API
    url = "http://localhost:8000/ingest"
    print(f"Uploading to {url}...")
    
    try:
        async with httpx.AsyncClient() as client:
            with open(pdf_path, 'rb') as f:
                files = {'file': (pdf_path, f, 'application/pdf')}
                response = await client.post(url, files=files)
                
        if response.status_code == 200:
            print("SUCCESS: Data ingested successfully!")
            print("Server Response:", response.json())
        else:
            print(f"ERROR: Server returned {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"CONNECTION ERROR: Is the server running? {e}")
    
    # 3. Cleanup
    try:
        os.remove(pdf_path)
        print("Cleaned up temporary file.")
    except:
        pass

if __name__ == "__main__":
    asyncio.run(main())
