<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/5 to-surface-50 py-8 px-4">
    <!-- Success State -->
    <div v-if="isSubmitted" class="flex items-center justify-center">
      <div class="w-full max-w-md text-center bg-white rounded-lg shadow-xl p-6">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon class="w-8 h-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold text-surface-900 mb-2">Thank You!</h2>
        <p class="text-surface-600 mb-2">
          Detected sentiment:
          <span class="font-semibold capitalize text-primary">{{ sentiment }}</span>
        </p>

        <p class="text-surface-600 mb-4">
          Your feedback has been submitted successfully. Your input helps us improve our events for the Solo Parent
          Federation community.
        </p>
        <button
          @click="resetForm"
          class="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-md transition-colors"
        >
          Submit Another Response
        </button>
      </div>
    </div>

    <!-- Main Form -->
    <div v-else class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UsersIcon class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-3xl font-bold text-surface-900 mb-2">Event Feedback</h1>
        <p class="text-surface-600 max-w-xl mx-auto">
          Share your thoughts about our Solo Parent Federation events. Your honest feedback helps us create better
          experiences for our community.
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="p-6 border-b border-surface-200">
          <h2 class="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
            <MessageSquareIcon class="w-5 h-5" />
            Your Feedback
          </h2>
          <p class="text-surface-600">Please share your thoughts, feelings, and experiences about our events</p>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="feedback" class="block text-base font-medium text-surface-900 mb-2">
                Tell us about your experience *
              </label>
              <textarea
                id="feedback"
                v-model="feedback"
                placeholder="Share your thoughts about the event - what you liked, didn't like, how it made you feel, suggestions for improvement, or anything else you'd like us to know..."
                rows="12"
                class="w-full px-4 py-3 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base leading-relaxed resize-none"
                required
              ></textarea>
              <p class="text-sm text-surface-500 mt-2">{{ feedback.length }} characters</p>
            </div>

            <div class="flex justify-center">
              <button
                type="submit"
                :disabled="isSubmitting || !feedback.trim()"
                class="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-8 py-3 text-lg rounded-md transition-colors"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="text-center mt-6 text-sm text-surface-500">
        <p>Your feedback is anonymous and will be used to improve our services.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db } from '@/services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { HeartIcon, UsersIcon, MessageSquareIcon } from 'lucide-vue-next'
import { analyzeSentiment } from '@/services/sentiment'

const feedback = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const sentiment = ref('') // 🆕 Add this

const handleSubmit = async () => {
  if (!feedback.value.trim()) return

  isSubmitting.value = true

  // Step 1: Analyze sentiment
  const result = await analyzeSentiment(feedback.value)
  sentiment.value = result || 'unknown'

  // Step 2: Save to Firestore
  try {
    await addDoc(collection(db, 'feedback'), {
      feedback: feedback.value,
      sentiment: sentiment.value,
      timestamp: serverTimestamp(),
      anonymous: true
    })
  } catch (error) {
    console.error('❌ Failed to save feedback:', error)
  }

  isSubmitting.value = false
  isSubmitted.value = true
}

const resetForm = () => {
  isSubmitted.value = false
  feedback.value = ''
  sentiment.value = ''
}
</script>


<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, rgba(128, 0, 32, 0.05), #f8fafc);
}

.text-primary {
  color: #800020;
}

.bg-primary {
  background-color: #800020;
}

.bg-primary\/10 {
  background-color: rgba(128, 0, 32, 0.1);
}

.bg-primary\/90 {
  background-color: rgba(128, 0, 32, 0.9);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(128, 0, 32, 0.9);
}

.focus\:ring-primary:focus {
  --tw-ring-color: #800020;
}

.text-surface-900 {
  color: #0f172a;
}

.text-surface-600 {
  color: #475569;
}

.text-surface-500 {
  color: #64748b;
}

.border-surface-200 {
  border-color: #e2e8f0;
}

.border-surface-300 {
  border-color: #cbd5e1;
}

.from-primary\/5 {
  --tw-gradient-from: rgba(128, 0, 32, 0.05);
}

.to-surface-50 {
  --tw-gradient-to: #f8fafc;
}
</style>
