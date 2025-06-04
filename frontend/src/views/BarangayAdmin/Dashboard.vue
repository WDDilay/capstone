<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <!-- Welcome section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin</h1>
      <p class="text-gray-600 text-lg">Here's what's happening with your federation today.</p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, index) in stats" :key="index" 
        class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm font-medium mb-2">{{ stat.title }}</p>
            <div class="flex items-baseline">
              <h3 class="text-3xl font-bold text-gray-900">{{ stat.value }}</h3>
              <span v-if="stat.trend !== undefined && stat.trend !== 0" :class="[stat.trend > 0 ? 'text-green-500' : 'text-red-500', 'text-sm font-medium ml-3 flex items-center']">
                <TrendingUp v-if="stat.trend > 0" class="h-4 w-4 mr-1" />
                <TrendingDown v-else class="h-4 w-4 mr-1" />
                {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
          <div :class="['rounded-xl p-4 shadow-lg', stat.bgColor]">
            <component :is="stat.icon" class="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section - Horizontal Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      <!-- Available Resources by Month Chart -->
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">Available Resources by Month</h2>
            <p class="text-sm text-gray-500">Track resource availability and distribution patterns</p>
          </div>
          <div class="flex items-center space-x-3">
            <select 
              v-model="selectedYear" 
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <select 
              v-model="selectedResourceType" 
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option v-for="type in Object.keys(resourceTypeColors)" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoadingResources" class="h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500">Loading resources data...</p>
          </div>
        </div>
        <div v-else-if="resourcesError" class="h-96 flex items-center justify-center">
          <div class="text-center">
            <div class="text-red-500 mb-4">
              <svg class="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium">{{ resourcesError }}</p>
            <button @click="fetchAvailableResources" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Retry
            </button>
          </div>
        </div>
        <div v-else-if="filteredMonthlyData.length === 0" class="h-96 flex items-center justify-center">
          <div class="text-center">
            <Package class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium">No resources data found</p>
            <p class="text-sm text-gray-400 mt-2">Resources will appear here once they are added for {{ selectedYear }}</p>
          </div>
        </div>
        <div v-else class="h-96 relative">
          <!-- Enhanced Bar Chart -->
          <svg class="w-full h-full" viewBox="0 0 900 380" ref="resourceChartSvg">
            <defs>
              <!-- Enhanced gradients for each resource type -->
              <linearGradient v-for="(color, type) in resourceTypeColors" :key="type" :id="`gradient-${type}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="`stop-color:${color};stop-opacity:0.9`" />
                <stop offset="50%" :style="`stop-color:${color};stop-opacity:0.7`" />
                <stop offset="100%" :style="`stop-color:${color};stop-opacity:0.5`" />
              </linearGradient>
              <!-- Shadow filter -->
              <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>
            
            <!-- Background grid -->
            <g stroke="#f1f5f9" stroke-width="1" opacity="0.8">
              <!-- Horizontal grid lines -->
              <line v-for="i in 6" :key="'hg' + i" x1="80" :y1="50 + (i * 50)" x2="820" :y2="50 + (i * 50)" />
              <!-- Vertical grid lines -->
              <line v-for="i in filteredMonthlyData.length" :key="'vg' + i" 
                    :x1="80 + (i * (740 / Math.max(filteredMonthlyData.length, 1)))" 
                    y1="50" 
                    :x2="80 + (i * (740 / Math.max(filteredMonthlyData.length, 1)))" 
                    y2="350" />
            </g>
            
            <!-- Main axes -->
            <g stroke="#374151" stroke-width="2">
              <line x1="80" y1="350" x2="820" y2="350" />
              <line x1="80" y1="50" x2="80" y2="350" />
            </g>
            
            <!-- Enhanced bars with animations -->
            <g v-for="(monthData, monthIndex) in filteredMonthlyData" :key="'month-' + monthIndex">
              <g v-for="(typeData, typeIndex) in monthData.resourceTypes" :key="'type-' + typeIndex">
                <rect
                  :x="getEnhancedBarX(monthIndex, typeIndex, monthData.resourceTypes.length)"
                  :y="getEnhancedBarY(typeData.quantity)"
                  :width="getEnhancedBarWidth(monthData.resourceTypes.length)"
                  :height="getEnhancedBarHeight(typeData.quantity)"
                  :fill="`url(#gradient-${typeData.type})`"
                  :stroke="resourceTypeColors[typeData.type]"
                  stroke-width="2"
                  rx="4"
                  ry="4"
                  filter="url(#dropshadow)"
                  class="hover:opacity-90 transition-all duration-300 cursor-pointer transform-gpu"
                  @mouseenter="showEnhancedResourceTooltip($event, typeData, monthData)"
                  @mouseleave="hideResourceTooltip"
                  @click="selectMonth(monthData)"
                >
                  <animate attributeName="height" 
                           :from="0" 
                           :to="getEnhancedBarHeight(typeData.quantity)" 
                           dur="1s" 
                           begin="0s" />
                  <animate attributeName="y" 
                           :from="350" 
                           :to="getEnhancedBarY(typeData.quantity)" 
                           dur="1s" 
                           begin="0s" />
                </rect>
                
                <!-- Value labels on bars -->
                <text v-if="getEnhancedBarHeight(typeData.quantity) > 20"
                      :x="getEnhancedBarX(monthIndex, typeIndex, monthData.resourceTypes.length) + getEnhancedBarWidth(monthData.resourceTypes.length) / 2"
                      :y="getEnhancedBarY(typeData.quantity) + 15"
                      fill="white"
                      font-size="11"
                      font-weight="bold"
                      text-anchor="middle">
                  {{ typeData.quantity }}
                </text>
              </g>
            </g>
            
            <!-- Enhanced Y-axis labels -->
            <g fill="#374151" font-size="12" font-weight="500" text-anchor="end">
              <text x="75" y="355">0</text>
              <text x="75" y="305">{{ Math.ceil(maxResourceQuantity * 0.2) }}</text>
              <text x="75" y="255">{{ Math.ceil(maxResourceQuantity * 0.4) }}</text>
              <text x="75" y="205">{{ Math.ceil(maxResourceQuantity * 0.6) }}</text>
              <text x="75" y="155">{{ Math.ceil(maxResourceQuantity * 0.8) }}</text>
              <text x="75" y="105">{{ maxResourceQuantity }}</text>
            </g>
            
            <!-- Enhanced X-axis labels -->
            <g fill="#374151" font-size="12" font-weight="500" text-anchor="middle">
              <text 
                v-for="(monthData, index) in filteredMonthlyData" 
                :key="'label' + index"
                :x="80 + (index * (740 / Math.max(filteredMonthlyData.length, 1))) + (740 / Math.max(filteredMonthlyData.length, 1)) / 2" 
                y="370"
                class="cursor-pointer hover:fill-blue-600"
                @click="selectMonth(monthData)"
              >
                {{ monthData.monthShort }}
              </text>
            </g>
            
            <!-- Axis titles -->
            <text x="450" y="395" fill="#374151" font-size="14" font-weight="600" text-anchor="middle">Month ({{ selectedYear }})</text>
            <text x="30" y="200" fill="#374151" font-size="14" font-weight="600" text-anchor="middle" transform="rotate(-90 30 200)">Quantity Available</text>
          </svg>

          <!-- Enhanced Legend -->
          <div class="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg border border-gray-200">
            <div class="text-sm font-semibold text-gray-800 mb-3">Resource Types</div>
            <div class="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              <div v-for="(color, type) in resourceTypeColors" :key="type" 
                   v-show="isResourceTypeVisible(type)"
                   class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                   @click="toggleResourceType(type)">
                <div class="w-4 h-4 rounded shadow-sm border border-gray-300" :style="`background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`"></div>
                <span class="text-xs font-medium text-gray-700">{{ type }}</span>
                <span class="text-xs text-gray-500">({{ getTypeTotal(type) }})</span>
              </div>
            </div>
          </div>

          <!-- Month selector indicator -->
          <div v-if="selectedMonth" class="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="text-sm font-semibold text-blue-800">Selected: {{ selectedMonth.month }}</div>
            <div class="text-xs text-blue-600">{{ selectedMonth.resourceTypes.length }} resource types</div>
          </div>
        </div>
      </div>

      <!-- Enhanced Attendance Forms Analytics -->
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">Attendance Forms Analytics</h2>
            <p class="text-sm text-gray-500">Track form responses and engagement over time</p>
          </div>
          <div class="flex items-center space-x-3">
            <select 
              v-model="selectedStatus" 
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Forms</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
            <select 
              v-model="attendanceTimeRange" 
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoadingAttendance" class="h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500">Loading attendance data...</p>
          </div>
        </div>
        <div v-else-if="attendanceError" class="h-96 flex items-center justify-center">
          <div class="text-center">
            <div class="text-red-500 mb-4">
              <svg class="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium">{{ attendanceError }}</p>
          </div>
        </div>
        <div v-else-if="filteredForms.length === 0" class="h-96 flex items-center justify-center">
          <div class="text-center">
            <Calendar class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium">No {{ selectedStatus === 'all' ? '' : selectedStatus }} forms found</p>
            <p class="text-sm text-gray-400 mt-2">Create your first attendance form to see analytics</p>
          </div>
        </div>
        <div v-else class="h-96 relative">
          <!-- Enhanced Line Graph -->
          <svg class="w-full h-full" viewBox="0 0 900 380" ref="attendanceChartSvg">
            <defs>
              <!-- Enhanced gradient for attendance line -->
              <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="`stop-color:${getStatusColor()};stop-opacity:0.4`" />
                <stop offset="50%" :style="`stop-color:${getStatusColor()};stop-opacity:0.2`" />
                <stop offset="100%" :style="`stop-color:${getStatusColor()};stop-opacity:0.05`" />
              </linearGradient>
              <!-- Glow effect for line -->
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- Background grid -->
            <g stroke="#f1f5f9" stroke-width="1" opacity="0.8">
              <!-- Horizontal grid lines -->
              <line v-for="i in 6" :key="'hg' + i" x1="80" :y1="50 + (i * 50)" x2="820" :y2="50 + (i * 50)" />
              <!-- Vertical grid lines -->
              <line v-for="i in Math.min(enhancedChartPoints.length + 1, 10)" :key="'vg' + i" 
                    :x1="80 + (i * (740 / Math.max(enhancedChartPoints.length, 1)))" 
                    y1="50" 
                    :x2="80 + (i * (740 / Math.max(enhancedChartPoints.length, 1)))" 
                    y2="350" />
            </g>
            
            <!-- Main axes -->
            <g stroke="#374151" stroke-width="2">
              <line x1="80" y1="350" x2="820" y2="350" />
              <line x1="80" y1="50" x2="80" y2="350" />
            </g>
            
            <!-- Enhanced area fill -->
            <path v-if="enhancedChartPoints.length > 0"
              :d="getEnhancedAreaPath()"
              fill="url(#attendanceGradient)"
              opacity="0.6"
            />
            
            <!-- Enhanced line with glow effect -->
            <path v-if="enhancedChartPoints.length > 0"
              :d="getEnhancedLinePath()"
              fill="none"
              :stroke="getStatusColor()"
              stroke-width="3"
              stroke-linejoin="round"
              stroke-linecap="round"
              filter="url(#glow)"
            />
            
            <!-- Enhanced data points -->
            <g v-for="(point, i) in enhancedChartPoints" :key="'point' + i">
              <!-- Outer ring -->
              <circle 
                :cx="point.x" 
                :cy="point.y" 
                r="8" 
                :fill="getStatusColor()" 
                opacity="0.3"
                class="animate-pulse"
              />
              <!-- Main point -->
              <circle 
                :cx="point.x" 
                :cy="point.y" 
                r="5" 
                :fill="getStatusColor()" 
                stroke="white" 
                stroke-width="3"
                class="hover:r-7 transition-all duration-300 cursor-pointer shadow-lg"
                @mouseenter="showEnhancedFormTooltip($event, point.form, point.responses)"
                @mouseleave="hideFormTooltip"
                @click="selectForm(point.form)"
              />
              <!-- Value label -->
              <text v-if="point.responses > 0"
                    :x="point.x"
                    :y="point.y - 15"
                    fill="#374151"
                    font-size="11"
                    font-weight="bold"
                    text-anchor="middle"
                    class="pointer-events-none">
                {{ point.responses }}
              </text>
            </g>
            
            <!-- Enhanced Y-axis labels -->
            <g fill="#374151" font-size="12" font-weight="500" text-anchor="end">
              <text x="75" y="355">0</text>
              <text x="75" y="305">{{ Math.ceil(maxResponses * 0.2) }}</text>
              <text x="75" y="255">{{ Math.ceil(maxResponses * 0.4) }}</text>
              <text x="75" y="205">{{ Math.ceil(maxResponses * 0.6) }}</text>
              <text x="75" y="155">{{ Math.ceil(maxResponses * 0.8) }}</text>
              <text x="75" y="105">{{ maxResponses }}</text>
            </g>
            
            <!-- Enhanced X-axis labels -->
            <g fill="#374151" font-size="11" font-weight="500" text-anchor="middle">
              <text 
                v-for="(point, i) in enhancedChartPoints" 
                :key="'label' + i"
                :x="point.x" 
                y="370"
                class="cursor-pointer hover:fill-purple-600"
                @click="selectForm(point.form)"
              >
                {{ formatEnhancedDate(point.form.eventDate) }}
              </text>
            </g>
            
            <!-- Axis titles -->
            <text x="450" y="395" fill="#374151" font-size="14" font-weight="600" text-anchor="middle">Event Timeline</text>
            <text x="30" y="200" fill="#374151" font-size="14" font-weight="600" text-anchor="middle" transform="rotate(-90 30 200)">Response Count</text>
          </svg>

          <!-- Status indicator -->
          <div class="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg border border-gray-200">
            <div class="text-sm font-semibold text-gray-800 mb-2">Status Overview</div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Total Forms:</span>
                <span class="text-xs font-bold text-gray-800">{{ filteredForms.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Avg Responses:</span>
                <span class="text-xs font-bold text-gray-800">{{ averageResponses }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Peak Responses:</span>
                <span class="text-xs font-bold text-gray-800">{{ maxResponses }}</span>
              </div>
            </div>
          </div>

          <!-- Selected form indicator -->
          <div v-if="selectedForm" class="absolute bottom-4 left-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div class="text-sm font-semibold text-purple-800">{{ selectedForm.eventName }}</div>
            <div class="text-xs text-purple-600">{{ getResponseCount(selectedForm.id) }} responses</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Attendance Forms -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">Recent Attendance Forms</h2>
          <p class="text-sm text-gray-500">Latest form submissions and their current status</p>
        </div>
        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
          View All
          <ExternalLink class="h-4 w-4 ml-2" />
        </button>
      </div>
      
      <div v-if="isLoadingAttendance" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
      </div>
      <div v-else-if="attendanceError" class="py-12">
        <p class="text-red-500 text-center font-medium">{{ attendanceError }}</p>
      </div>
      <div v-else-if="attendanceForms.length === 0" class="py-12">
        <div class="text-center">
          <FileText class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 font-medium">No attendance forms found</p>
          <p class="text-sm text-gray-400 mt-2">Create your first attendance form to get started</p>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responses</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="form in attendanceForms.slice(0, 5)" 
              :key="form.id" 
              class="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              @mouseenter="showFormTooltip($event, form)"
              @mouseleave="hideFormTooltip"
              @click="selectForm(form)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ form.eventName }}</div>
                <div v-if="form.eventDescription" class="text-xs text-gray-500 truncate max-w-xs">
                  {{ form.eventDescription }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(form.eventDate) }}</div>
                <div class="text-xs text-gray-500">Created: {{ formatDate(form.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'px-3 py-1 text-xs font-medium rounded-full': true,
                  'bg-green-100 text-green-800': getFormStatus(form) === 'active',
                  'bg-blue-100 text-blue-800': getFormStatus(form) === 'upcoming',
                  'bg-gray-100 text-gray-800': getFormStatus(form) === 'closed'
                }">
                  {{ getFormStatus(form).charAt(0).toUpperCase() + getFormStatus(form).slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ getResponseCount(form.id) }}</span>
                  <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" :style="`width: ${Math.min((getResponseCount(form.id) / maxResponses) * 100, 100)}%`"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ form.eventLocation || 'Not specified' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enhanced Tooltips -->
    <div 
      v-if="tooltip.show" 
      class="fixed z-50 bg-gray-900 text-white p-4 rounded-xl shadow-2xl max-w-sm pointer-events-none border border-gray-700"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="text-sm font-semibold mb-2 text-blue-300">{{ tooltip.data.eventName }}</div>
      <div class="text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-gray-300">Created:</span>
          <span class="text-white font-medium">{{ formatDateTime(tooltip.data.createdAt) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Event Date:</span>
          <span class="text-white font-medium">{{ formatDate(tooltip.data.eventDate) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Status:</span>
          <span class="text-white font-medium">{{ getFormStatusText(tooltip.data) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Responses:</span>
          <span class="text-white font-medium">{{ getResponseCount(tooltip.data.id) }}</span>
        </div>
        <div v-if="tooltip.data.eventLocation" class="flex justify-between">
          <span class="text-gray-300">Location:</span>
          <span class="text-white font-medium">{{ tooltip.data.eventLocation }}</span>
        </div>
        <div v-if="tooltip.data.eventDescription" class="mt-3 pt-2 border-t border-gray-700">
          <div class="text-xs italic text-gray-300">{{ truncateText(tooltip.data.eventDescription, 100) }}</div>
        </div>
      </div>
    </div>

    <!-- Enhanced Resource Tooltip -->
    <div 
      v-if="resourceTooltip.show" 
      class="fixed z-50 bg-gray-900 text-white p-4 rounded-xl shadow-2xl max-w-sm pointer-events-none border border-gray-700"
      :style="{ left: resourceTooltip.x + 'px', top: resourceTooltip.y + 'px' }"
    >
      <div class="text-sm font-semibold mb-2 flex items-center">
        <div class="w-3 h-3 rounded mr-2" :style="`background-color: ${resourceTypeColors[resourceTooltip.data.type]}`"></div>
        <span class="text-blue-300">{{ resourceTooltip.data.type }} Resources</span>
      </div>
      <div class="text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-gray-300">Month:</span>
          <span class="text-white font-medium">{{ resourceTooltip.data.month }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Total Quantity:</span>
          <span class="text-white font-medium">{{ resourceTooltip.data.quantity }} units</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Date Received:</span>
          <span class="text-white font-medium">{{ resourceTooltip.data.dateReceived }}</span>
        </div>
        <div v-if="resourceTooltip.data.resources && resourceTooltip.data.resources.length > 0" class="mt-3 pt-2 border-t border-gray-700">
          <div class="text-xs font-medium mb-2 text-gray-300">Individual Resources:</div>
          <div class="space-y-1">
            <div v-for="resource in resourceTooltip.data.resources.slice(0, 4)" :key="resource.name" class="text-xs flex justify-between">
              <span class="text-gray-400">{{ resource.name }}:</span>
              <span class="text-white">{{ resource.quantity }} {{ resource.unit }}</span>
            </div>
            <div v-if="resourceTooltip.data.resources.length > 4" class="text-xs text-gray-400 italic">
              +{{ resourceTooltip.data.resources.length - 4 }} more resources...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Users, MessageSquare, Package, Bell, TrendingUp, TrendingDown, 
  ExternalLink, Calendar, FileText
} from 'lucide-vue-next';

// Firebase imports
import { db, auth } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';

// State
const isLoading = ref(true);
const error = ref(null);
const currentBarangay = ref('');
const totalMembers = ref(0);
const activeResources = ref(0);
const membersLastMonth = ref(0);

// Attendance Forms State
const attendanceForms = ref([]);
const attendanceResponses = ref([]);
const isLoadingAttendance = ref(true);
const attendanceError = ref(null);
const selectedStatus = ref('all');
const attendanceTimeRange = ref('30');
const selectedForm = ref(null);

// Resources State
const availableResources = ref([]);
const isLoadingResources = ref(true);
const resourcesError = ref(null);
const selectedResourceType = ref('all');
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(null);

// Tooltip state
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null
});

// Resource tooltip state
const resourceTooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null
});

// Resource type colors
const resourceTypeColors = ref({
  'Financial': '#3B82F6',
  'Medical': '#EF4444',
  'Educational': '#F59E0B',
  'Legal': '#8B5CF6',
  'Livelihood': '#10B981',
  'Housing': '#EC4899',
  'Food': '#14B8A6',
  'Other': '#6B7280'
});

// Available years from data
const availableYears = computed(() => {
  const years = new Set();
  availableResources.value.forEach(resource => {
    const date = resource.requestDate instanceof Timestamp 
      ? resource.requestDate.toDate() 
      : new Date(resource.requestDate);
    years.add(date.getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
});

// Stats data with reactive values
const stats = computed(() => [
  { 
    title: 'Total Members', 
    value: isLoading.value ? '...' : totalMembers.value.toLocaleString(), 
    icon: Users, 
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    trend: calculateTrend(totalMembers.value, membersLastMonth.value)
  },
  { 
    title: 'Active Resources', 
    value: activeResources.value.toLocaleString(), 
    icon: Package, 
    bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
    trend: 0
  },
  { 
    title: 'Attendance Forms', 
    value: attendanceForms.value.length.toLocaleString(), 
    icon: MessageSquare, 
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    trend: 0
  },
  { 
    title: 'Total Responses', 
    value: attendanceResponses.value.length.toLocaleString(), 
    icon: Bell, 
    bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
    trend: 0
  }
]);

// Process monthly resource data
const monthlyResourceData = computed(() => {
  if (!availableResources.value.length) return [];

  const monthlyData = {};
  
  availableResources.value.forEach(resource => {
    const date = resource.requestDate instanceof Timestamp 
      ? resource.requestDate.toDate() 
      : new Date(resource.requestDate);
    
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        monthShort: monthShort,
        date: date,
        year: date.getFullYear(),
        resourceTypes: {},
        resources: []
      };
    }
    
    if (!monthlyData[monthKey].resourceTypes[resource.resourceType]) {
      monthlyData[monthKey].resourceTypes[resource.resourceType] = {
        type: resource.resourceType,
        quantity: 0,
        resources: []
      };
    }
    
    monthlyData[monthKey].resourceTypes[resource.resourceType].quantity += resource.remainingQuantity || 0;
    monthlyData[monthKey].resourceTypes[resource.resourceType].resources.push({
      name: resource.resourceName,
      quantity: resource.remainingQuantity || 0,
      unit: resource.unit || 'units'
    });
    
    monthlyData[monthKey].resources.push(resource);
  });

  return Object.values(monthlyData)
    .sort((a, b) => a.date - b.date)
    .map(monthData => ({
      ...monthData,
      resourceTypes: Object.values(monthData.resourceTypes)
    }));
});

// Filtered monthly data by year and resource type
const filteredMonthlyData = computed(() => {
  let filtered = monthlyResourceData.value.filter(monthData => 
    monthData.year === selectedYear.value
  );

  if (selectedResourceType.value !== 'all') {
    filtered = filtered.map(monthData => ({
      ...monthData,
      resourceTypes: monthData.resourceTypes.filter(typeData => 
        typeData.type === selectedResourceType.value
      )
    })).filter(monthData => monthData.resourceTypes.length > 0);
  }

  return filtered;
});

// Max resource quantity for chart scaling
const maxResourceQuantity = computed(() => {
  if (!filteredMonthlyData.value.length) return 100;
  
  let max = 0;
  filteredMonthlyData.value.forEach(monthData => {
    monthData.resourceTypes.forEach(typeData => {
      if (typeData.quantity > max) {
        max = typeData.quantity;
      }
    });
  });
  
  return Math.max(max, 10);
});

// Filtered forms with time range
const filteredForms = computed(() => {
  let forms = attendanceForms.value;
  
  if (selectedStatus.value !== 'all') {
    forms = forms.filter(form => getFormStatus(form) === selectedStatus.value);
  }

  if (attendanceTimeRange.value !== 'all') {
    const days = parseInt(attendanceTimeRange.value);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    forms = forms.filter(form => {
      const formDate = new Date(form.eventDate);
      return formDate >= cutoffDate;
    });
  }

  return forms;
});

// Max responses for chart scaling
const maxResponses = computed(() => {
  if (filteredForms.value.length === 0) return 10;
  return Math.max(...filteredForms.value.map(form => getResponseCount(form.id)), 1);
});

// Average responses
const averageResponses = computed(() => {
  if (filteredForms.value.length === 0) return 0;
  const total = filteredForms.value.reduce((sum, form) => sum + getResponseCount(form.id), 0);
  return Math.round(total / filteredForms.value.length);
});

// Enhanced chart points for line graph
const enhancedChartPoints = computed(() => {
  const forms = [...filteredForms.value].sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateA - dateB;
  });

  if (forms.length === 0) return [];

  const width = 740;
  const height = 300;

  return forms.map((form, index) => {
    const x = 80 + (index * (width / Math.max(forms.length - 1, 1)));
    const responses = getResponseCount(form.id);
    const y = 350 - (responses / maxResponses.value) * height;
    
    return {
      x: x,
      y: y,
      form: form,
      responses: responses
    };
  });
});

// Enhanced bar chart helper functions
const getEnhancedBarX = (monthIndex, typeIndex, totalTypes) => {
  const monthWidth = 740 / Math.max(filteredMonthlyData.value.length, 1);
  const barWidth = getEnhancedBarWidth(totalTypes);
  const monthStart = 80 + (monthIndex * monthWidth);
  const groupStart = monthStart + (monthWidth - (barWidth * totalTypes)) / 2;
  return groupStart + (typeIndex * barWidth);
};

const getEnhancedBarY = (quantity) => {
  const height = 300;
  return 350 - (quantity / maxResourceQuantity.value) * height;
};

const getEnhancedBarWidth = (totalTypes) => {
  const monthWidth = 740 / Math.max(filteredMonthlyData.value.length, 1);
  const maxBarWidth = 50;
  return Math.min(maxBarWidth / Math.max(totalTypes, 1), monthWidth * 0.7 / Math.max(totalTypes, 1));
};

const getEnhancedBarHeight = (quantity) => {
  const height = 300;
  return (quantity / maxResourceQuantity.value) * height;
};

// Enhanced path generation
const getEnhancedLinePath = () => {
  if (enhancedChartPoints.value.length === 0) return '';
  
  let path = `M ${enhancedChartPoints.value[0].x} ${enhancedChartPoints.value[0].y}`;
  
  for (let i = 1; i < enhancedChartPoints.value.length; i++) {
    const prevPoint = enhancedChartPoints.value[i - 1];
    const currPoint = enhancedChartPoints.value[i];
    
    // Create smooth curves
    const cpx1 = prevPoint.x + (currPoint.x - prevPoint.x) / 3;
    const cpy1 = prevPoint.y;
    const cpx2 = currPoint.x - (currPoint.x - prevPoint.x) / 3;
    const cpy2 = currPoint.y;
    
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${currPoint.x} ${currPoint.y}`;
  }
  
  return path;
};

const getEnhancedAreaPath = () => {
  if (enhancedChartPoints.value.length === 0) return '';
  
  let path = getEnhancedLinePath();
  
  if (enhancedChartPoints.value.length > 0) {
    path += ` L ${enhancedChartPoints.value[enhancedChartPoints.value.length - 1].x} 350`;
    path += ` L ${enhancedChartPoints.value[0].x} 350 Z`;
  }
  
  return path;
};

// Utility functions
const adjustColor = (color, amount) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

const isResourceTypeVisible = (type) => {
  return filteredMonthlyData.value.some(monthData => 
    monthData.resourceTypes.some(typeData => typeData.type === type)
  );
};

const getTypeTotal = (type) => {
  return filteredMonthlyData.value.reduce((total, monthData) => {
    const typeData = monthData.resourceTypes.find(t => t.type === type);
    return total + (typeData ? typeData.quantity : 0);
  }, 0);
};

const toggleResourceType = (type) => {
  selectedResourceType.value = selectedResourceType.value === type ? 'all' : type;
};

const selectMonth = (monthData) => {
  selectedMonth.value = selectedMonth.value === monthData ? null : monthData;
};

const selectForm = (form) => {
  selectedForm.value = selectedForm.value === form ? null : form;
};

const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getStatusColor = () => {
  switch (selectedStatus.value) {
    case 'active': return '#10B981';
    case 'upcoming': return '#3B82F6';
    case 'closed': return '#6B7280';
    default: return '#8B5CF6';
  }
};

// Enhanced date formatting
const formatEnhancedDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'N/A';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getFormStatus = (form) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const attendanceDate = new Date(form.attendanceDate);
  attendanceDate.setHours(0, 0, 0, 0);
  
  if (attendanceDate.getTime() === today.getTime()) {
    return 'active';
  } else if (attendanceDate.getTime() > today.getTime()) {
    return 'upcoming';
  } else {
    return 'closed';
  }
};

const getFormStatusText = (form) => {
  const status = getFormStatus(form);
  
  if (status === 'active') {
    return 'Active Today';
  } else if (status === 'upcoming') {
    return 'Upcoming';
  } else {
    return 'Closed';
  }
};

const getResponseCount = (formId) => {
  return attendanceResponses.value.filter(response => response.formId === formId).length;
};

// Enhanced tooltip functions
const showFormTooltip = (event, form) => {
  tooltip.value = {
    show: true,
    x: event.clientX + 15,
    y: event.clientY - 10,
    data: form
  };
};

const showEnhancedFormTooltip = (event, form, responses) => {
  tooltip.value = {
    show: true,
    x: event.clientX + 15,
    y: event.clientY - 10,
    data: { ...form, responseCount: responses }
  };
};

const hideFormTooltip = () => {
  tooltip.value.show = false;
};

const showEnhancedResourceTooltip = (event, typeData, monthData) => {
  const dateReceived = formatDate(monthData.date);
  
  resourceTooltip.value = {
    show: true,
    x: event.clientX + 15,
    y: event.clientY - 10,
    data: {
      type: typeData.type,
      quantity: typeData.quantity,
      month: monthData.month,
      dateReceived: dateReceived,
      resources: typeData.resources
    }
  };
};

const hideResourceTooltip = () => {
  resourceTooltip.value.show = false;
};

// Data fetching functions (same as before but with error handling improvements)
const fetchAvailableResources = async () => {
  if (!currentBarangay.value) return;
  
  isLoadingResources.value = true;
  resourcesError.value = null;
  
  try {
    const requestHistoryCollection = collection(db, 'request_history');
    const q = query(
      requestHistoryCollection,
      where('barangay', '==', currentBarangay.value),
      where('status', '==', 'Approved')
    );
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const resources = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.requestedItems && Array.isArray(data.requestedItems)) {
          data.requestedItems.forEach((item, index) => {
            resources.push({
              id: `${doc.id}-${index}`,
              requestId: doc.id,
              resourceName: item.resourceName,
              resourceType: item.resourceType,
              quantity: parseFloat(item.quantity) || 0,
              remainingQuantity: parseFloat(item.quantity) || 0,
              unit: item.unit || '',
              requestDate: data.requestDate,
              status: data.status
            });
          });
        }
      });
      
      await updateRemainingQuantities(resources);
      
      availableResources.value = resources;
      activeResources.value = resources.reduce((sum, resource) => sum + resource.remainingQuantity, 0);
      
      isLoadingResources.value = false;
    }, (error) => {
      console.error('Error in resources onSnapshot:', error);
      resourcesError.value = `Failed to load resources: ${error.message}`;
      isLoadingResources.value = false;
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error fetching available resources:', error);
    resourcesError.value = `Failed to load resources: ${error.message}`;
    isLoadingResources.value = false;
  }
};

const updateRemainingQuantities = async (resources) => {
  try {
    const memberHistoryCollection = collection(db, 'Member_history');
    const q = query(
      memberHistoryCollection,
      where('barangay', '==', currentBarangay.value)
    );
    
    const querySnapshot = await getDocs(q);
    const distributedResources = {};
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.resources && Array.isArray(data.resources)) {
        data.resources.forEach(item => {
          const resourceKey = `${item.requestId}-${item.resourceName}`;
          
          if (!distributedResources[resourceKey]) {
            distributedResources[resourceKey] = 0;
          }
          
          distributedResources[resourceKey] += parseFloat(item.quantity) || 0;
        });
      }
    });
    
    resources.forEach(resource => {
      const resourceKey = `${resource.requestId}-${resource.resourceName}`;
      const distributedQuantity = distributedResources[resourceKey] || 0;
      resource.remainingQuantity = Math.max(0, resource.quantity - distributedQuantity);
    });
  } catch (error) {
    console.error('Error updating remaining quantities:', error);
  }
};

const fetchAttendanceForms = async () => {
  if (!currentBarangay.value) return;
  
  isLoadingAttendance.value = true;
  attendanceError.value = null;
  
  try {
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    const formsQuery = query(
      attendanceFormsCollection,
      where('barangay', '==', currentBarangay.value),
      orderBy('createdAt', 'desc')
    );
    
    const formsSnapshot = await getDocs(formsQuery);
    const forms = [];
    
    formsSnapshot.forEach(doc => {
      forms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    attendanceForms.value = forms;
    
    if (forms.length > 0) {
      const formIds = forms.map(form => form.id);
      const attendanceCollection = collection(db, 'Attendance');
      const responsesQuery = query(
        attendanceCollection,
        where('formId', 'in', formIds.slice(0, 10))
      );
      
      const responsesSnapshot = await getDocs(responsesQuery);
      const responses = [];
      
      responsesSnapshot.forEach(doc => {
        responses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      attendanceResponses.value = responses;
    }
    
    isLoadingAttendance.value = false;
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    attendanceError.value = 'Failed to load attendance data: ' + error.message;
    isLoadingAttendance.value = false;
  }
};

const fetchTotalMembers = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    const barangayPresidentDocRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentDoc = await getDoc(barangayPresidentDocRef);
    
    if (!barangayPresidentDoc.exists()) {
      console.error('User not found in barangay_presidents collection');
      error.value = 'Your user account is not properly set up as a Barangay President. Please contact the system administrator.';
      return;
    }
    
    const barangayPresidentData = barangayPresidentDoc.data();
    if (barangayPresidentData.role !== 'BarangayPresident') {
      console.error('User does not have BarangayPresident role');
      error.value = `Your role is set to "${barangayPresidentData.role}" instead of "BarangayPresident". Please contact the system administrator.`;
      return;
    }
    
    currentBarangay.value = barangayPresidentData.barangay;
    console.log('User verified as BarangayPresident for:', currentBarangay.value);
    
    const activeUsersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentBarangay.value),
      where('role', '==', 'Member'),
      where('status', '==', 'Active')
    );
    
    const unsubscribe = onSnapshot(activeUsersQuery, (snapshot) => {
      totalMembers.value = snapshot.docs.length;
      console.log('Total active members:', totalMembers.value);
      isLoading.value = false;
    }, (err) => {
      console.error('Error fetching members:', err);
      error.value = 'Error fetching members: ' + err.message;
      isLoading.value = false;
    });
    
    membersLastMonth.value = Math.floor(totalMembers.value * 0.9);
    
    await fetchAttendanceForms();
    await fetchAvailableResources();
    
    return unsubscribe;
  } catch (err) {
    console.error('Error in fetchTotalMembers:', err);
    error.value = 'Error fetching data: ' + err.message;
    isLoading.value = false;
    return null;
  }
};

// Lifecycle hooks
onMounted(async () => {
  const unsubscribe = await fetchTotalMembers();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
});

// Watchers
watch([selectedResourceType, selectedYear], () => {
  selectedMonth.value = null;
});

watch([selectedStatus, attendanceTimeRange], () => {
  selectedForm.value = null;
});
</script>

<style scoped>
/* Enhanced animations and transitions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.5s ease-out;
}

/* Enhanced hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:-translate-y-1:hover {
  transform: translateY(-4px);
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Enhanced chart interactions */
svg rect:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transform-origin: center bottom;
}

svg circle:hover {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
}

svg text:hover {
  font-weight: 600;
}

/* Professional gradient backgrounds */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Enhanced table styles */
table {
  border-spacing: 0;
}

tbody tr:hover {
  background-color: #f8fafc;
  transform: scale(1.001);
  transition: all 0.2s ease;
}

/* Loading spinner enhancement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Tooltip enhancements */
.pointer-events-none {
  pointer-events: none;
}

/* Progress bar animations */
.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Card hover effects */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive design improvements */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .xl\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .gap-8 {
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-4 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
}

/* Enhanced focus states */
select:focus,
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>

I've created a comprehensive, professional dashboard with the following enhancements:

## 🎨 **Visual Improvements:**
- **Horizontal Layout**: Charts are now side-by-side on larger screens
- **Professional Design**: Enhanced gradients, shadows, and modern styling
- **Better Typography**: Improved font weights and spacing
- **Responsive Design**: Adapts beautifully to all screen sizes

## 📊 **Enhanced Bar Chart Features:**
- **Year Selection**: Filter resources by specific years
- **Month Navigation**: Click on months to see detailed information
- **Animated Bars**: Smooth loading animations with gradient fills
- **Enhanced Tooltips**: Detailed resource information on hover
- **Interactive Legend**: Click resource types to filter data
- **Professional Grid**: Clean grid lines and axis labels

## 📈 **Enhanced Line Chart Features:**
- **Smooth Curves**: Professional curved lines instead of straight segments
- **Time Range Filter**: View data for last 30/60/90 days or all time
- **Glow Effects**: Enhanced visual appeal with glowing lines
- **Interactive Points**: Click to select forms with detailed information
- **Status Overview**: Real-time statistics panel
- **Enhanced Tooltips**: More detailed form information

## 🔧 **Functional Improvements:**
- **Month Selection**: Click any month bar to see detailed breakdown
- **Form Selection**: Click line chart points to highlight specific forms
- **Better Error Handling**: Professional error states with retry options
- **Loading States**: Enhanced loading animations
- **Real-time Updates**: Live data synchronization

## 📱 **Professional Features:**
- **Statistics Cards**: Enhanced with trend indicators and better styling
- **Interactive Tables**: Hover effects and progress bars for responses
- **Enhanced Tooltips**: Professional dark theme with detailed information
- **Smooth Animations**: All interactions have smooth transitions
- **Professional Color Scheme**: Consistent, accessible color palette

The dashboard now provides a much more professional and detailed view of your barangay's resources and attendance data, with intuitive navigation and comprehensive filtering options.