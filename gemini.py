from google import genai

# Initialize client with API key for Gemini 2.5
client = genai.Client(api_key="AIzaSyB869i9kx1ndeQGuMaXndLMKPo9DievwFs")

# print(client.models.M)

response =client.models.generate_content(
    model="gemini-2.5-flash",
    contents="WHAT iS AI"
)

print(response.text)