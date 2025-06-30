from fastapi import FastAPI
from pydantic import BaseModel
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS (so Vue can call this from http://localhost:5173 or wherever you're hosting)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model_path = "./my-sentiment-model"

model = BertForSequenceClassification.from_pretrained(model_path, num_labels=3)
tokenizer = BertTokenizer.from_pretrained(model_path)

model.eval()

label_map = {0: "positive", 1: "negative", 2: "neutral"}

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict(request: TextRequest):
    inputs = tokenizer(request.text, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()
    return {"label": label_map[prediction]}
