<template>
  <div class="dashboard-content">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="header-text">
            <h1>Sentiment Analysis Dashboard</h1>
            <p>Solo Parent Federation Events</p>
          </div>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span class="btn-text">{{ loading ? 'Loading...' : 'Refresh' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total-card" @mouseenter="animateCard" @mouseleave="resetCard">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <h3>Total Feedback</h3>
            <p class="stat-number">{{ animatedStats.total }}</p>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
          </div>
        </div>

        <div class="stat-card positive-card" @mouseenter="animateCard" @mouseleave="resetCard">
          <div class="stat-icon">
            <i class="fas fa-smile"></i>
          </div>
          <div class="stat-content">
            <h3>Positive</h3>
            <p class="stat-number">{{ animatedStats.positive }}</p>
            <span class="stat-percentage">{{ positivePercentage }}%</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar positive-progress" :style="{ width: positivePercentage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card neutral-card" @mouseenter="animateCard" @mouseleave="resetCard">
          <div class="stat-icon">
            <i class="fas fa-meh"></i>
          </div>
          <div class="stat-content">
            <h3>Neutral</h3>
            <p class="stat-number">{{ animatedStats.neutral }}</p>
            <span class="stat-percentage">{{ neutralPercentage }}%</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar neutral-progress" :style="{ width: neutralPercentage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card negative-card" @mouseenter="animateCard" @mouseleave="resetCard">
          <div class="stat-icon">
            <i class="fas fa-frown"></i>
          </div>
          <div class="stat-content">
            <h3>Negative</h3>
            <p class="stat-number">{{ animatedStats.negative }}</p>
            <span class="stat-percentage">{{ negativePercentage }}%</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar negative-progress" :style="{ width: negativePercentage + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chart Section -->
    <section class="chart-section">
      <div class="chart-card">
        <div class="card-header">
          <h2>Sentiment Distribution</h2>
          <div class="chart-controls">
            <button 
              class="chart-type-btn" 
              :class="{ active: chartType === 'pie' }"
              @click="changeChartType('pie')"
              :title="'Pie Chart'"
            >
              <i class="fas fa-chart-pie"></i>
            </button>
            <button 
              class="chart-type-btn" 
              :class="{ active: chartType === 'doughnut' }"
              @click="changeChartType('doughnut')"
              :title="'Doughnut Chart'"
            >
              <i class="fas fa-circle-notch"></i>
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="sentimentChart" :width="canvasSize" :height="canvasSize"></canvas>
        </div>
      </div>
    </section>

    <!-- Feedback Section -->
    <section class="feedback-section">
      <div class="feedback-card">
        <div class="card-header">
          <h2>Recent Feedback</h2>
          <div class="filter-buttons">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              class="filter-btn" 
              :class="{ active: selectedFilter === filter.value }"
              @click="changeFilter(filter.value)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
        <div class="feedback-list">
          <transition-group name="feedback" tag="div">
            <div 
              v-for="item in filteredFeedback" 
              :key="item.id" 
              class="feedback-item"
            >
              <div class="feedback-header">
                <span class="sentiment-badge" :class="item.sentiment">
                  <i :class="getSentimentIcon(item.sentiment)"></i>
                  <span class="sentiment-text">{{ item.sentiment }}</span>
                </span>
                <span class="anonymous-badge">
                  {{ item.anonymous ? 'Anonymous' : 'Identified' }}
                </span>
              </div>
              <div class="feedback-text">{{ item.feedback }}</div>
              <div class="feedback-meta">
                {{ formatTimestamp(item.timestamp) }}
              </div>
            </div>
          </transition-group>
          <div v-if="filteredFeedback.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No feedback found for the selected filter.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading Overlay -->
    <div class="loading-overlay" :class="{ show: loading }">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading data...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db } from '@/services/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'

// Reactive data
const loading = ref(false)
const canvasSize = ref(400)
const stats = ref({
  total: 0,
  positive: 0,
  neutral: 0,
  negative: 0
})

const animatedStats = ref({
  total: 0,
  positive: 0,
  neutral: 0,
  negative: 0
})

const feedbackData = ref([])
const selectedFilter = ref('all')
const chartType = ref('pie')
const sentimentChart = ref(null)

// Filter options
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' }
]

// Computed properties
const positivePercentage = computed(() => {
  return stats.value.total > 0 ? 
    ((stats.value.positive / stats.value.total) * 100).toFixed(1) : 0
})

const neutralPercentage = computed(() => {
  return stats.value.total > 0 ? 
    ((stats.value.neutral / stats.value.total) * 100).toFixed(1) : 0
})

const negativePercentage = computed(() => {
  return stats.value.total > 0 ? 
    ((stats.value.negative / stats.value.total) * 100).toFixed(1) : 0
})

const filteredFeedback = computed(() => {
  if (selectedFilter.value === 'all') {
    return feedbackData.value
  }
  return feedbackData.value.filter(item => item.sentiment === selectedFilter.value)
})

// Responsive canvas size
const updateCanvasSize = () => {
  const screenWidth = window.innerWidth
  if (screenWidth < 480) {
    canvasSize.value = 280
  } else if (screenWidth < 768) {
    canvasSize.value = 320
  } else if (screenWidth < 1024) {
    canvasSize.value = 360
  } else {
    canvasSize.value = 400
  }
  updateChart()
}

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }))

    feedbackData.value = data

    stats.value = {
      total: data.length,
      positive: data.filter(item => item.sentiment === 'positive').length,
      neutral: data.filter(item => item.sentiment === 'neutral').length,
      negative: data.filter(item => item.sentiment === 'negative').length
    }

    animateNumbers()
    updateChart()
  } catch (error) {
    console.error('❌ Error loading feedback from Firestore:', error)
  } finally {
    loading.value = false
  }
}

const animateNumbers = () => {
  const duration = 1000
  const startTime = performance.now()
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    
    animatedStats.value = {
      total: Math.floor(stats.value.total * easeOutQuart),
      positive: Math.floor(stats.value.positive * easeOutQuart),
      neutral: Math.floor(stats.value.neutral * easeOutQuart),
      negative: Math.floor(stats.value.negative * easeOutQuart)
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animatedStats.value = { ...stats.value }
    }
  }
  requestAnimationFrame(animate)
}

const createChart = () => {
  if (!sentimentChart.value) return
  const canvas = sentimentChart.value
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 40

  const data = [
    { label: 'Positive', value: stats.value.positive, color: '#10b981' },
    { label: 'Neutral', value: stats.value.neutral, color: '#f59e0b' },
    { label: 'Negative', value: stats.value.negative, color: '#ef4444' }
  ]

  const total = stats.value.total
  let currentAngle = -Math.PI / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (total === 0) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#e2e8f0'
    ctx.fill()
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#64748b'
    ctx.font = `bold ${Math.max(12, canvas.width / 25)}px Inter`
    ctx.textAlign = 'center'
    ctx.fillText('No Data', centerX, centerY)
    return
  }

  data.forEach((item) => {
    if (item.value > 0) {
      const sliceAngle = (item.value / total) * 2 * Math.PI
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius
      
      const percentage = ((item.value / total) * 100).toFixed(1)
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.max(10, canvas.width / 30)}px Inter`
      ctx.textAlign = 'center'
      ctx.fillText(`${percentage}%`, labelX, labelY)
      currentAngle += sliceAngle
    }
  })

  if (chartType.value === 'doughnut') {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.fillStyle = '#374151'
    ctx.font = `bold ${Math.max(16, canvas.width / 20)}px Inter`
    ctx.textAlign = 'center'
    ctx.fillText(total.toString(), centerX, centerY - 5)
    ctx.font = `${Math.max(10, canvas.width / 35)}px Inter`
    ctx.fillStyle = '#6b7280'
    ctx.fillText('Total', centerX, centerY + 15)
  }
}

const updateChart = () => {
  nextTick(() => {
    createChart()
  })
}

const changeFilter = (filter) => {
  selectedFilter.value = filter
}

const changeChartType = (type) => {
  chartType.value = type
  updateChart()
}

const refreshData = () => {
  loadData()
}

const getSentimentIcon = (sentiment) => {
  const icons = {
    positive: 'fas fa-smile',
    neutral: 'fas fa-meh',
    negative: 'fas fa-frown'
  }
  return icons[sentiment] || 'fas fa-comment'
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const animateCard = (event) => {
  if (window.innerWidth < 768) return // Disable on mobile for performance
  
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = (y - centerY) / 10
  const rotateY = (centerX - x) / 10
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`
}

const resetCard = (event) => {
  if (window.innerWidth < 768) return
  
  const card = event.currentTarget
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
}

// Lifecycle hooks
onMounted(() => {
  loadData()
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Base Container */
.dashboard-content {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, rgba(133, 40, 216, 0.05) 0%, #f8fafc 100%);
  color: #0f172a;
  line-height: 1.6;
  width: 100%;
  padding: 1rem;
}

/* Header Section */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  backdrop-filter: blur(20px);
  margin-bottom: 1.5rem;
}

.header-content {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.logo {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #871717ff, #891919ff);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  flex-shrink: 0;
}

.header-text {
  min-width: 0;
  flex: 1;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #0f172a, #730606ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.header-text p {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.header-right {
  flex-shrink: 0;
}

.refresh-btn {
  background: linear-gradient(135deg, #791515ff, #861a1aff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.refresh-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.refresh-btn:hover::before {
  left: 100%;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Stats Section */
.stats-section {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.positive-card::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.neutral-card::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.negative-card::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.total-card .stat-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
  color: #3b82f6;
}

.positive-card .stat-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  color: #10b981;
}

.neutral-card .stat-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  color: #f59e0b;
}

.negative-card .stat-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: #ef4444;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-content h3 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-percentage {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.positive-card .stat-percentage {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.neutral-card .stat-percentage {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.negative-card .stat-percentage {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-progress {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin-top: 0.75rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.positive-progress {
  background: linear-gradient(90deg, #10b981, #059669);
}

.neutral-progress {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.negative-progress {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* Chart Section */
.chart-section {
  margin-bottom: 1.5rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
  gap: 1rem;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #0f172a, #730606ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.chart-type-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #475569;
  font-size: 1rem;
}

.chart-type-btn:hover {
  background: #f8fafc;
  border-color: #730606ff;
  transform: scale(1.05);
}

.chart-type-btn.active {
  background: linear-gradient(135deg, #8b1919ff, #7a1313ff);
  border-color: #730606ff;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.chart-container {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* Feedback Section */
.feedback-section {
  margin-bottom: 1.5rem;
}

.feedback-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-btn:hover {
  background: #f8fafc;
  border-color: #730606ff;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #8b1919ff, #7a1313ff);
  border-color: #730606ff;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.feedback-list {
  max-height: 500px;
  overflow-y: auto;
}

.feedback-item {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.feedback-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #8c1a1aff, #951313ff);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.feedback-item:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8));
  transform: translateX(8px);
}

.feedback-item:hover::before {
  transform: scaleY(1);
}

.feedback-item:last-child {
  border-bottom: none;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.sentiment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sentiment-text {
  display: inline;
}

.sentiment-badge.positive {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.sentiment-badge.neutral {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.sentiment-badge.negative {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.anonymous-badge {
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f1f5f9, #f8fafc);
  color: #475569;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #e2e8f0;
}

.feedback-text {
  color: #334155;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.975rem;
}

.feedback-meta {
  display: flex;
  justify-content: flex-end;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-weight: 500;
  font-size: 1rem;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.loading-overlay.show {
  opacity: 1;
  visibility: visible;
}

.loading-spinner {
  text-align: center;
  color: #a31e1eff;
}

.loading-spinner i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-weight: 600;
  font-size: 1.125rem;
}

/* Vue Transitions */
.feedback-enter-active,
.feedback-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.feedback-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.feedback-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
.feedback-list::-webkit-scrollbar {
  width: 6px;
}

.feedback-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 3px;
}

.feedback-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

/* ===== RESPONSIVE DESIGN BREAKPOINTS ===== */

/* Extra Small Devices (Phones) - 320px to 479px */
@media (max-width: 479px) {
  .dashboard-content {
    padding: 0.5rem;
  }

  .header-content {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .logo {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .header-text h1 {
    font-size: 1.125rem;
  }

  .header-text p {
    font-size: 0.8rem;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem;
  }

  .btn-text {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-content h3 {
    font-size: 0.7rem;
  }

  .card-header {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .card-header h2 {
    font-size: 1rem;
    text-align: center;
  }

  .chart-controls {
    justify-content: center;
  }

  .chart-type-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.875rem;
  }

  .chart-container {
    padding: 1rem;
    min-height: 250px;
  }

  .filter-buttons {
    justify-content: center;
  }

  .filter-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .feedback-item {
    padding: 1rem;
  }

  .feedback-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .sentiment-badge {
    justify-content: center;
    padding: 0.5rem;
  }

  .sentiment-text {
    display: none;
  }

  .anonymous-badge {
    text-align: center;
  }

  .feedback-text {
    font-size: 0.875rem;
  }

  .feedback-meta {
    justify-content: center;
    font-size: 0.75rem;
  }
}

/* Small Devices (Phones) - 480px to 767px */
@media (min-width: 480px) and (max-width: 767px) {
  .dashboard-content {
    padding: 0.75rem;
  }

  .header-content {
    padding: 1.25rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .header-left {
    justify-content: center;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .refresh-btn {
    align-self: stretch;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.25rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .card-header {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .chart-controls {
    justify-content: center;
  }

  .filter-buttons {
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    min-width: 0;
  }

  .feedback-header {
    justify-content: space-between;
    align-items: center;
  }
}

/* Medium Devices (Tablets) - 768px to 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-content {
    padding: 1rem;
  }

  .header-content {
    padding: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.375rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2.25rem;
  }

  .chart-container {
    min-height: 350px;
  }

  .card-header {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }
}

/* Large Devices (Desktops) - 1024px to 1279px */
@media (min-width: 1024px) and (max-width: 1279px) {
  .dashboard-content {
    padding: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .chart-container {
    min-height: 380px;
  }
}

/* Extra Large Devices (Large Desktops) - 1280px+ */
@media (min-width: 1280px) {
  .dashboard-content {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  .stat-card {
    padding: 2rem;
  }

  .chart-container {
    min-height: 400px;
  }

  .feedback-list {
    max-height: 600px;
  }
}
</style>