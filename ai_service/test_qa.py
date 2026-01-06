import httpx
import asyncio

async def test():
    url = "http://localhost:8000/chat"
    topic = "What is the secret wifi password?"
    print(f"Asking: {topic}")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={"text": topic})
            data = resp.json()
            print("\n--- AI RESPONSE ---")
            print(f"Response: {data.get('response')}")
            print(f"Sources: {data.get('sources')}")
            print("-------------------")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
