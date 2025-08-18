<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-white text-black py-20 overflow-hidden">
      <div class="absolute inset-0"></div>
      <div class="relative container mx-auto px-6">
        <div class="flex flex-wrap items-center justify-between">
          <div class="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h1 class="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-black">
              Empowered Solo Parents
            </h1>
            <p class="text-xl mb-8 text-black/90 leading-relaxed">
              Join our thriving community and access the support, resources, and connections you need to flourish as a
              solo parent.
            </p>
            <button class="bg-purple-700 text-white hover:bg-purple-800 font-semibold px-8 py-4 text-lg rounded-lg transition-colors">
              Get Started Today
            </button>
          </div>
          <div class="w-full lg:w-1/2 lg:pl-12">
            <div class="relative">
              <img
                src="@/assets/SPFAMILY.jpg"
                alt="Solo Parent Family"
                class="rounded-2xl shadow-2xl w-full"
              />
              <div class="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div class="flex items-center gap-2 text-black">
                  <Heart class="w-5 h-5 fill-current" />
                  <span class="font-semibold">Join 2,500+ Parents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">How We Support You</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the comprehensive support system designed specifically for solo parents like you.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
          >
            <div class="text-center pb-4 pt-8 px-6">
              <div class="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <component :is="feature.icon" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ feature.title }}</h3>
            </div>
            <div class="text-center px-6 pb-8">
              <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Carousel Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Latest Federation Updates</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay connected with our community events, programs, and opportunities designed for solo parents.
          </p>
        </div>

        <div class="relative max-w-4xl mx-auto">
          <div class="overflow-hidden rounded-2xl">
            <div
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <div
                v-for="post in federationPosts"
                :key="post.id"
                class="w-full flex-shrink-0"
              >
                <div class="mx-4 bg-white rounded-lg shadow-xl border-0">
                  <div class="md:flex">
                    <div class="md:w-1/2">
                      <img
                        :src="post.imageUrl"
                        :alt="post.title"
                        class="w-full h-64 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                    <div class="md:w-1/2 p-8">
                      <div class="flex items-center gap-2 mb-3">
                        <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {{ post.category }}
                        </span>
                        <div class="flex items-center text-gray-500 text-sm">
                          <Calendar class="w-4 h-4 mr-1" />
                          {{ post.date }}
                        </div>
                      </div>
                      <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ post.title }}</h3>
                      <p class="text-gray-600 mb-6 leading-relaxed">{{ post.description }}</p>
                      <div class="flex items-center gap-6 text-gray-500">
                        <div class="flex items-center gap-1">
                          <Heart class="w-5 h-5" />
                          <span>{{ post.likes }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <MessageCircle class="w-5 h-5" />
                          <span>{{ post.comments }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="prevSlide"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft class="w-6 h-6 text-gray-600" />
          </button>
          <button
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight class="w-6 h-6 text-gray-600" />
          </button>

          <div class="flex justify-center mt-8 gap-2">
            <button
              v-for="(_, index) in federationPosts"
              :key="index"
              @click="currentSlide = index"
              :class="[ 'w-3 h-3 rounded-full transition-colors', index === currentSlide ? 'bg-purple-600' : 'bg-gray-300' ]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold mb-6">Ready to Join Our Solo Parent Federation?</h2>
        <p class="text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
          Take the first step towards a supportive network of solo parents who understand your journey and celebrate
          your strength. Pre-register here now!
        </p>
       <button
    @click="$router.push('/pre-member')"
        class="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg transition-colors"
          >
          Sign Up Now
            </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/services/firebase'

const currentSlide = ref(0)
let slideInterval = null

const federationPosts = ref([])

const fetchPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"))
    const postsArray = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    federationPosts.value = postsArray
  } catch (error) {
    console.error("Error fetching posts: ", error)
  }
}

onMounted(() => {
  fetchPosts()
  slideInterval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % federationPosts.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + federationPosts.value.length) % federationPosts.value.length
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
