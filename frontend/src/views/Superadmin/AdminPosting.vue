<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create New Post
            </h1>
            <p class="mt-1 text-sm text-gray-600">Share events and workshops with the community</p>
          </div>
          <div class="mt-4 sm:mt-0 flex space-x-3">
            <button
              @click="saveDraft"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving ? 'Saving...' : 'Save Draft' }}
            </button>
            <button
              @click="publishPost"
              :disabled="!canPublish || saving"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {{ saving ? 'Publishing...' : 'Publish Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Image Upload -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Cover Image</h3>
              <p class="text-sm text-gray-600">Upload an engaging image to showcase your event</p>
            </div>
            <div class="p-6">
              <div
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                :class="[
                  'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
                  isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                ]"
              >
                <div v-if="!imagePreview" class="space-y-4">
                  <div class="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-lg font-medium text-gray-900">Drop your image here</p>
                    <p class="text-sm text-gray-600">or click to browse files</p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileSelect"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div v-else class="relative">
                  <img :src="imagePreview" alt="Preview" class="max-h-64 mx-auto rounded-lg shadow-md" />
                  <button
                    @click="removeImage"
                    class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Post Content</h3>
            </div>
            <div class="p-6 space-y-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="Enter an engaging title..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-medium"
                />
                <p class="mt-1 text-sm text-gray-500">{{ title.length }}/100 characters</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="description"
                  rows="8"
                  placeholder="Write a compelling description that showcases the value of your event or workshop..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                ></textarea>
                <p class="mt-1 text-sm text-gray-500">{{ description.length }}/1000 characters</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Publishing Status -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Publishing Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Status</span>
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  postStatus === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]">
                  {{ postStatus === 'published' ? 'Published' : 'Draft' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Visibility</span>
                <span class="text-sm font-medium text-purple-600">Public</span>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-xl p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="showError" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Content Tips -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Content Tips</h3>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start">
                <span class="text-purple-600 mr-2">•</span>
                Use high-quality, engaging images
              </li>
              <li class="flex items-start">
                <span class="text-purple-600 mr-2">•</span>
                Write compelling titles that grab attention
              </li>
              <li class="flex items-start">
                <span class="text-purple-600 mr-2">•</span>
                Highlight the benefits for solo parents
              </li>
              <li class="flex items-start">
                <span class="text-purple-600 mr-2">•</span>
                Include clear calls-to-action
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db, storage } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// Reactive state
const title = ref('')
const description = ref('')
const imageFile = ref(null)
const imagePreview = ref('')
const isDragging = ref(false)
const saving = ref(false)
const postStatus = ref('draft')
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const canPublish = computed(() => {
  return title.value.trim().length > 0 && description.value.trim().length > 0
})

// File handling methods
const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    handleFile(file)
  }
}

const handleFile = (file) => {
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
}

const uploadImage = async () => {
  if (!imageFile.value) return null
  
  try {
    const timestamp = Date.now()
    const fileName = `posts/${timestamp}_${imageFile.value.name}`
    const imageRef = storageRef(storage, fileName)
    
    const snapshot = await uploadBytes(imageRef, imageFile.value)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

const savePost = async (status = 'draft') => {
  if (!canPublish.value && status === 'published') {
    showErrorMessage('Please fill in all required fields before publishing.')
    return
  }

  saving.value = true
  showSuccess.value = false
  showError.value = false

  try {
    let imageUrl = null
    
    // Upload image if present
    if (imageFile.value) {
      imageUrl = await uploadImage()
    }

    const postData = {
      title: title.value.trim(),
      description: description.value.trim(),
      imageUrl,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Admin', // You can get this from auth context
      visibility: 'public'
    }

    // Save to Firestore using the user's Firebase setup
    const docRef = await addDoc(collection(db, 'posts'), postData)
    
    postStatus.value = status
    showSuccessMessage(
      status === 'published' 
        ? 'Post published successfully!' 
        : 'Draft saved successfully!'
    )

    // Clear form if published
    if (status === 'published') {
      clearForm()
    }

  } catch (error) {
    console.error('Error saving post:', error)
    showErrorMessage('Failed to save post. Please try again.')
  } finally {
    saving.value = false
  }
}

const saveDraft = () => savePost('draft')
const publishPost = () => savePost('published')

const clearForm = () => {
  title.value = ''
  description.value = ''
  removeImage()
  postStatus.value = 'draft'
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 5000)
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 5000)
}
</script>
