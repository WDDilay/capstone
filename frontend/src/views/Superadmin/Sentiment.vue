<template>
  <div class="dashboard-content">
    <!-- Header Section - Simplified for layout compatibility -->
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
            {{ loading ? 'Loading...' : 'Refresh' }}
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
            >
              <i class="fas fa-chart-pie"></i>
            </button>
            <button 
              class="chart-type-btn" 
              :class="{ active: chartType === 'doughnut' }"
              @click="changeChartType('doughnut')"
            >
              <i class="fas fa-circle-notch"></i>
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="sentimentChart" width="400" height="400"></canvas>
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
                  {{ item.sentiment }}
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

import { ref, computed, onMounted, nextTick } from 'vue'

// Reactive data
const loading = ref(false)
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

// Sample data


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
  const radius = Math.min(centerX, centerY) - 60

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
    ctx.font = 'bold 16px Inter'
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
      ctx.lineWidth = 3
      ctx.stroke()

      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius
      
      const percentage = ((item.value / total) * 100).toFixed(1)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Inter'
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
    ctx.font = 'bold 24px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(total.toString(), centerX, centerY - 5)
    ctx.font = '12px Inter'
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
  const card = event.currentTarget
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* FIXED: Container that works within router-view */
.dashboard-content {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, rgba(133, 40, 216, 0.05) 0%, #f8fafc 100%);
  color: #0f172a;
  line-height: 1.6;
  /* REMOVED: min-height, positioning that conflicts with layout */
  width: 100%;
}

/* FIXED: Header that doesn't conflict with layout */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  backdrop-filter: blur(20px);
  margin-bottom: 2rem;
  /* REMOVED: sticky positioning, z-index conflicts */
}

.header-content {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #8528d8, #6d28d9);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.header-text h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #0f172a, #8528d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
}

.refresh-btn {
  background: linear-gradient(135deg, #8528d8, #6d28d9);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
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
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.5rem;
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
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
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
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-percentage {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
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
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
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
  margin-bottom: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.card-header {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #0f172a, #8528d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-type-btn {
  width: 3rem;
  height: 3rem;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #475569;
  font-size: 1.125rem;
}

.chart-type-btn:hover {
  background: #f8fafc;
  border-color: #8528d8;
  transform: scale(1.05);
}

.chart-type-btn.active {
  background: linear-gradient(135deg, #8528d8, #6d28d9);
  border-color: #8528d8;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.chart-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Feedback Section */
.feedback-section {
  margin-bottom: 2rem;
}

.feedback-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.25rem;
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
  padding: 0.75rem 1.25rem;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  border-radius: 0.75rem;
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
  border-color: #8528d8;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #8528d8, #6d28d9);
  border-color: #8528d8;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.feedback-list {
  max-height: 600px;
  overflow-y: auto;
}

.feedback-item {
  padding: 2rem;
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
  background: linear-gradient(135deg, #8528d8, #6d28d9);
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
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.sentiment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 1rem;
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
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-weight: 500;
  font-size: 1.125rem;
}

/* FIXED: Loading overlay with proper z-index */
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
  z-index: 40; /* Lower than sidebar/topnav */
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
  color: #8528d8;
}

.loading-spinner i {
  font-size: 3rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filter-buttons {
    width: 100%;
  }

  .chart-container {
    padding: 1rem;
    min-height: 300px;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}

/* Custom Scrollbar */
.feedback-list::-webkit-scrollbar {
  width: 8px;
}

.feedback-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

.feedback-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}
</style>
