// src/services/sentiment.js
import axios from 'axios'

export async function analyzeSentiment(text) {
  try {
    const response = await axios.post('http://localhost:8000/predict', { text })
    return response.data.label
  } catch (err) {
    console.error("Sentiment analysis error:", err)
    return null
  }
}
