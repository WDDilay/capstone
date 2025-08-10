<template>
  <div class="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin</h1>
      <p class="text-sm sm:text-base text-gray-600">Here's what's happening with your federation today.</p>
    </div>

     
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      <div v-for="(stat, index) in stats" :key="index"
           class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-gray-500 text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate">{{ stat.title }}</p>
            <div class="flex items-baseline">
              <h3 class="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{{ stat.value }}</h3>
              <span v-if="stat.trend !== undefined && stat.trend !== 0" :class="[stat.trend > 0 ? 'text-green-500' : 'text-red-500', 'text-xs sm:text-sm font-medium ml-1 sm:ml-3 flex items-center']">
                <TrendingUp v-if="stat.trend > 0" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <TrendingDown v-else class="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span class="hidden sm:inline">{{ Math.abs(stat.trend) }}%</span>
              </span>
            </div>
          </div>
          <div :class="['rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg ml-2', stat.bgColor]">
            <component :is="stat.icon" class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </div>
        </div>
      </div>
    </div>

     
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
      <div class="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Available Resources by Month</h2>
            <p class="text-xs sm:text-sm text-gray-500">Track resource availability and distribution patterns</p>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <select 
              v-model="selectedYear"
              class="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <select 
              v-model="selectedResourceType"
              class="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option v-for="type in Object.keys(resourceTypeColors)" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingResources" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500 text-sm">Loading resources data...</p>
          </div>
        </div>
        <div v-else-if="resourcesError" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <div class="text-red-500 mb-4">
              <svg class="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium text-sm">{{ resourcesError }}</p>
            <button @click="fetchAvailableResources" class="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md sm:rounded-lg hover:bg-blue-600 transition-colors text-sm">
              Retry
            </button>
          </div>
        </div>
        <div v-else-if="filteredMonthlyData.length === 0" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <Package class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium text-sm sm:text-base">No resources data found</p>
            <p class="text-xs sm:text-sm text-gray-400 mt-2">Resources will appear here once they are added for {{ selectedYear }}</p>
          </div>
        </div>
        <div v-else class="h-64 sm:h-80 md:h-96 relative">
            
          <svg class="w-full h-full" :viewBox="isMobile ? '0 0 400 300' : '0 0 900 380'" ref="resourceChartSvg">
            <defs>
                
              <linearGradient v-for="(color, type) in resourceTypeColors" :key="type" :id="`gradient-${type}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="`stop-color:${color};stop-opacity:0.9`" />
                <stop offset="50%" :style="`stop-color:${color};stop-opacity:0.7`" />
                <stop offset="100%" :style="`stop-color:${color};stop-opacity:0.5`" />
              </linearGradient>
               
              <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>
              
            <g stroke="#f1f5f9" stroke-width="1" opacity="0.8">
               
              <line v-for="i in 6" :key="'hg' + i" :x1="isMobile ? 40 : 80" :y1="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" :x2="isMobile ? 360 : 820" :y2="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" />
               
              <line v-for="i in filteredMonthlyData.length" :key="'vg' + i"
                   :x1="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(filteredMonthlyData.length, 1)))"
                   :y1="isMobile ? 40 : 50"
                   :x2="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(filteredMonthlyData.length, 1)))"
                   :y2="isMobile ? 280 : 350" />
            </g>
             
            <g stroke="#374151" stroke-width="2">
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 280 : 350" :x2="isMobile ? 360 : 820" :y2="isMobile ? 280 : 350" />
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 40 : 50" :x2="isMobile ? 40 : 80" :y2="isMobile ? 280 : 350" />
            </g>
             
            <g v-for="(monthData, monthIndex) in filteredMonthlyData" :key="'month-' + monthIndex">
              <g v-for="(typeData, typeIndex) in monthData.resourceTypes" :key="'type-' + typeIndex">
                <rect
                  :x="getResponsiveBarX(monthIndex, typeIndex, monthData.resourceTypes.length)"
                  :y="getResponsiveBarY(typeData.quantity)"
                  :width="getResponsiveBarWidth(monthData.resourceTypes.length)"
                  :height="getResponsiveBarHeight(typeData.quantity)"
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
                           :to="getResponsiveBarHeight(typeData.quantity)"
                           dur="1s"
                           begin="0s" />
                  <animate attributeName="y"
                           :from="isMobile ? 280 : 350"
                           :to="getResponsiveBarY(typeData.quantity)"
                           dur="1s"
                           begin="0s" />
                </rect>
                
                <text v-if="getResponsiveBarHeight(typeData.quantity) > 15 && !isMobile"
                     :x="getResponsiveBarX(monthIndex, typeIndex, monthData.resourceTypes.length) + getResponsiveBarWidth(monthData.resourceTypes.length) / 2"
                     :y="getResponsiveBarY(typeData.quantity) + 15"
                     fill="white"
                     :font-size="isMobile ? '9' : '11'"
                     font-weight="bold"
                     text-anchor="middle">
                  {{ typeData.quantity }}
                </text>
              </g>
            </g>
             
            <g fill="#374151" :font-size="isMobile ? '10' : '12'" font-weight="500" text-anchor="end">
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 285 : 355">0</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 240 : 305">{{ Math.ceil(maxResourceQuantity * 0.2) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 200 : 255">{{ Math.ceil(maxResourceQuantity * 0.4) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 160 : 205">{{ Math.ceil(maxResourceQuantity * 0.6) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 120 : 155">{{ Math.ceil(maxResourceQuantity * 0.8) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 80 : 105">{{ maxResourceQuantity }}</text>
            </g>
              
            <g fill="#374151" :font-size="isMobile ? '9' : '12'" font-weight="500" text-anchor="middle">
              <text
                v-for="(monthData, index) in filteredMonthlyData"
                :key="'label' + index"
                :x="(isMobile ? 40 : 80) + (index * ((isMobile ? 320 : 740) / Math.max(filteredMonthlyData.length, 1))) + ((isMobile ? 320 : 740) / Math.max(filteredMonthlyData.length, 1)) / 2"
                :y="isMobile ? 295 : 370"
                class="cursor-pointer hover:fill-blue-600"
                @click="selectMonth(monthData)"
              >
                {{ isMobile ? monthData.monthShort.substring(0, 3) : monthData.monthShort }}
              </text>
            </g>
             
            <text :x="isMobile ? 200 : 450" :y="isMobile ? 315 : 395" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle">Month ({{ selectedYear }})</text>
            <text :x="isMobile ? 15 : 30" :y="isMobile ? 160 : 200" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle" :transform="`rotate(-90 ${isMobile ? 15 : 30} ${isMobile ? 160 : 200})`">Quantity</text>
          </svg>
           
          <div class="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-95 rounded-md sm:rounded-lg p-2 sm:p-4 shadow-lg border border-gray-200 max-w-xs">
            <div class="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Resource Types</div>
            <div class="grid grid-cols-1 gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
              <div v-for="(color, type) in resourceTypeColors" :key="type"
                   v-show="isResourceTypeVisible(type)"
                   class="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                   @click="toggleResourceType(type)">
                <div class="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm border border-gray-300" :style="`background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`"></div>
                <span class="font-medium text-gray-700 truncate">{{ type }}</span>
                <span class="text-gray-500">({{ getTypeTotal(type) }})</span>
              </div>
            </div>
          </div>
           
          <div v-if="selectedMonth" class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg p-2 sm:p-3">
            <div class="text-xs sm:text-sm font-semibold text-blue-800">Selected: {{ selectedMonth.month }}</div>
            <div class="text-xs text-blue-600">{{ selectedMonth.resourceTypes.length }} resource types</div>
          </div>
        </div>
      </div>

        
      <div class="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Attendance Forms Analytics</h2>
            <p class="text-xs sm:text-sm text-gray-500">Track form responses and engagement over time</p>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <select 
              v-model="selectedStatus"
              class="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Forms</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
            <select 
              v-model="attendanceTimeRange"
              class="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingAttendance" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500 text-sm">Loading attendance data...</p>
          </div>
        </div>
        <div v-else-if="attendanceError" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <div class="text-red-500 mb-4">
              <svg class="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium text-sm">{{ attendanceError }}</p>
          </div>
        </div>
        <div v-else-if="filteredForms.length === 0" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <Calendar class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium text-sm sm:text-base">No {{ selectedStatus === 'all' ? '' : selectedStatus }} forms found</p>
            <p class="text-xs sm:text-sm text-gray-400 mt-2">Create your first attendance form to see analytics</p>
          </div>
        </div>
        <div v-else class="h-64 sm:h-80 md:h-96 relative">
           
          <svg class="w-full h-full" :viewBox="isMobile ? '0 0 400 300' : '0 0 900 380'" ref="attendanceChartSvg">
            <defs>
               
              <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="`stop-color:${getStatusColor()};stop-opacity:0.4`" />
                <stop offset="50%" :style="`stop-color:${getStatusColor()};stop-opacity:0.2`" />
                <stop offset="100%" :style="`stop-color:${getStatusColor()};stop-opacity:0.05`" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
             
            <g stroke="#f1f5f9" stroke-width="1" opacity="0.8">
                
              <line v-for="i in 6" :key="'hg' + i" :x1="isMobile ? 40 : 80" :y1="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" :x2="isMobile ? 360 : 820" :y2="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" />
               
              <line v-for="i in Math.min(enhancedChartPoints.length + 1, 10)" :key="'vg' + i"
                   :x1="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(enhancedChartPoints.length, 1)))"
                   :y1="isMobile ? 40 : 50"
                   :x2="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(enhancedChartPoints.length, 1)))"
                   :y2="isMobile ? 280 : 350" />
            </g>
             
            <g stroke="#374151" stroke-width="2">
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 280 : 350" :x2="isMobile ? 360 : 820" :y2="isMobile ? 280 : 350" />
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 40 : 50" :x2="isMobile ? 40 : 80" :y2="isMobile ? 280 : 350" />
            </g>
              
            <path v-if="enhancedChartPoints.length > 0"
              :d="getResponsiveAreaPath()"
              fill="url(#attendanceGradient)"
              opacity="0.6"
            />
             t 
            <path v-if="enhancedChartPoints.length > 0"
              :d="getResponsiveLinePath()"
              fill="none"
              :stroke="getStatusColor()"
              stroke-width="3"
              stroke-linejoin="round"
              stroke-linecap="round"
              filter="url(#glow)"
            />
              
            <g v-for="(point, i) in enhancedChartPoints" :key="'point' + i">
               Outer ring 
              <circle
                :cx="point.x"
                :cy="point.y"
                :r="isMobile ? 6 : 8"
                :fill="getStatusColor()"
                opacity="0.3"
                class="animate-pulse"
              />
               
              <circle
                :cx="point.x"
                :cy="point.y"
                :r="isMobile ? 3 : 5"
                :fill="getStatusColor()"
                stroke="white"
                stroke-width="2"
                class="hover:r-7 transition-all duration-300 cursor-pointer shadow-lg"
                @mouseenter="showEnhancedFormTooltip($event, point.form, point.responses)"
                @mouseleave="hideFormTooltip"
                @click="selectForm(point.form)"
              />
              
              <text v-if="point.responses > 0 && !isMobile"
                   :x="point.x"
                   :y="point.y - 15"
                   fill="#374151"
                   :font-size="isMobile ? '9' : '11'"
                   font-weight="bold"
                   text-anchor="middle"
                   class="pointer-events-none">
                {{ point.responses }}
              </text>
            </g>
             
            <g fill="#374151" :font-size="isMobile ? '10' : '12'" font-weight="500" text-anchor="end">
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 285 : 355">0</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 240 : 305">{{ Math.ceil(maxResponses * 0.2) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 200 : 255">{{ Math.ceil(maxResponses * 0.4) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 160 : 205">{{ Math.ceil(maxResponses * 0.6) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 120 : 155">{{ Math.ceil(maxResponses * 0.8) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 80 : 105">{{ maxResponses }}</text>
            </g>
             
            <g fill="#374151" :font-size="isMobile ? '9' : '11'" font-weight="500" text-anchor="middle">
              <text
                v-for="(point, i) in enhancedChartPoints"
                :key="'label' + i"
                :x="point.x"
                :y="isMobile ? 295 : 370"
                class="cursor-pointer hover:fill-purple-600"
                @click="selectForm(point.form)"
              >
                {{ formatEnhancedDate(point.form.eventDate) }}
              </text>
            </g>
             
            <text :x="isMobile ? 200 : 450" :y="isMobile ? 315 : 395" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle">Event Timeline</text>
            <text :x="isMobile ? 15 : 30" :y="isMobile ? 160 : 200" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle" :transform="`rotate(-90 ${isMobile ? 15 : 30} ${isMobile ? 160 : 200})`">Responses</text>
          </svg>
           
          <div class="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-95 rounded-md sm:rounded-lg p-2 sm:p-4 shadow-lg border border-gray-200">
            <div class="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Status Overview</div>
            <div class="space-y-1 sm:space-y-2">
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
           
          <div v-if="selectedForm" class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-purple-50 border border-purple-200 rounded-md sm:rounded-lg p-2 sm:p-3">
            <div class="text-xs sm:text-sm font-semibold text-purple-800">{{ selectedForm.eventName }}</div>
            <div class="text-xs text-purple-600">{{ getResponseCount(selectedForm.id) }} responses</div>
          </div>
        </div>
      </div>

       
      <div class="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Member Registration Trends</h2>
            <p class="text-xs sm:text-sm text-gray-500">Track member growth over time in {{ currentBarangay }}</p>
          </div>
          <div class="flex items-center">
            <select 
              v-model="selectedMemberYear"
              class="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option v-for="year in availableMemberYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingMembers" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-green-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500 text-sm">Loading member data...</p>
          </div>
        </div>
        <div v-else-if="memberError" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <div class="text-red-500 mb-4">
              <svg class="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium text-sm">{{ memberError }}</p>
          </div>
        </div>
        <div v-else-if="memberRegistrationData.length === 0" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <Users class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium text-sm sm:text-base">No member data found</p>
            <p class="text-xs sm:text-sm text-gray-400 mt-2">Member registration data will appear here</p>
          </div>
        </div>
        <div v-else class="h-64 sm:h-80 md:h-96 relative">
          
          <svg class="w-full h-full" :viewBox="isMobile ? '0 0 400 300' : '0 0 900 380'" ref="memberChartSvg">
            <defs>
              <linearGradient id="memberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:0.4" />
                <stop offset="50%" style="stop-color:#10B981;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#10B981;stop-opacity:0.05" />
              </linearGradient>
              <filter id="memberGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
             
            <g stroke="#f1f5f9" stroke-width="1" opacity="0.8">
              <line v-for="i in 6" :key="'hg' + i" :x1="isMobile ? 40 : 80" :y1="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" :x2="isMobile ? 360 : 820" :y2="(isMobile ? 40 : 50) + (i * (isMobile ? 40 : 50))" />
              <line v-for="i in Math.min(memberChartPoints.length + 1, 13)" :key="'vg' + i"
                   :x1="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(memberChartPoints.length, 1)))"
                   :y1="isMobile ? 40 : 50"
                   :x2="(isMobile ? 40 : 80) + (i * ((isMobile ? 320 : 740) / Math.max(memberChartPoints.length, 1)))"
                   :y2="isMobile ? 280 : 350" />
            </g>
             
            <g stroke="#374151" stroke-width="2">
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 280 : 350" :x2="isMobile ? 360 : 820" :y2="isMobile ? 280 : 350" />
              <line :x1="isMobile ? 40 : 80" :y1="isMobile ? 40 : 50" :x2="isMobile ? 40 : 80" :y2="isMobile ? 280 : 350" />
            </g>
            
            <path v-if="memberChartPoints.length > 0"
              :d="getResponsiveMemberAreaPath()"
              fill="url(#memberGradient)"
              opacity="0.6"
            />
              
            <path v-if="memberChartPoints.length > 0"
              :d="getResponsiveMemberLinePath()"
              fill="none"
              stroke="#10B981"
              stroke-width="3"
              stroke-linejoin="round"
              stroke-linecap="round"
              filter="url(#memberGlow)"
            />
             
            <g v-for="(point, i) in memberChartPoints" :key="'point' + i">
              <circle
                :cx="point.x"
                :cy="point.y"
                :r="isMobile ? 6 : 8"
                fill="#10B981"
                opacity="0.3"
                class="animate-pulse"
              />
              <circle
                :cx="point.x"
                :cy="point.y"
                :r="isMobile ? 3 : 5"
                fill="#10B981"
                stroke="white"
                stroke-width="2"
                class="hover:r-7 transition-all duration-300 cursor-pointer shadow-lg"
                @mouseenter="showMemberTooltip($event, point)"
                @mouseleave="hideMemberTooltip"
              />
              <text v-if="point.count > 0 && !isMobile"
                   :x="point.x"
                   :y="point.y - 15"
                   fill="#374151"
                   :font-size="isMobile ? '9' : '11'"
                   font-weight="bold"
                   text-anchor="middle"
                   class="pointer-events-none">
                {{ point.count }}
              </text>
            </g>
             Y-axis labels 
            <g fill="#374151" :font-size="isMobile ? '10' : '12'" font-weight="500" text-anchor="end">
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 285 : 355">0</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 240 : 305">{{ Math.ceil(maxMemberCount * 0.2) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 200 : 255">{{ Math.ceil(maxMemberCount * 0.4) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 160 : 205">{{ Math.ceil(maxMemberCount * 0.6) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 120 : 155">{{ Math.ceil(maxMemberCount * 0.8) }}</text>
              <text :x="isMobile ? 35 : 75" :y="isMobile ? 80 : 105">{{ maxMemberCount }}</text>
            </g>
             X-axis labels 
            <g fill="#374151" :font-size="isMobile ? '9' : '11'" font-weight="500" text-anchor="middle">
              <text
                v-for="(point, i) in memberChartPoints"
                :key="'label' + i"
                :x="point.x"
                :y="isMobile ? 295 : 370"
                class="cursor-pointer hover:fill-green-600">
                {{ isMobile ? point.month.substring(0, 3) : point.month }}
              </text>
            </g>
             Axis titles 
            <text :x="isMobile ? 200 : 450" :y="isMobile ? 315 : 395" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle">Month ({{ selectedMemberYear }})</text>
            <text :x="isMobile ? 15 : 30" :y="isMobile ? 160 : 200" fill="#374151" :font-size="isMobile ? '11' : '14'" font-weight="600" text-anchor="middle" :transform="`rotate(-90 ${isMobile ? 15 : 30} ${isMobile ? 160 : 200})`">New Members</text>
          </svg>
           
          <div class="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-95 rounded-md sm:rounded-lg p-2 sm:p-4 shadow-lg border border-gray-200">
            <div class="text-xs sm:text-sm font-semibold text-gray-800 mb-2">{{ selectedMemberYear }} Summary</div>
            <div class="space-y-1 sm:space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Total New:</span>
                <span class="text-xs font-bold text-gray-800">{{ yearlyMemberTotal }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Avg/Month:</span>
                <span class="text-xs font-bold text-gray-800">{{ averageMonthlyMembers }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">Peak Month:</span>
                <span class="text-xs font-bold text-gray-800">{{ peakMonth }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       
      <div class="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Member Status Distribution</h2>
            <p class="text-xs sm:text-sm text-gray-500">Current status breakdown of all members</p>
          </div>
        </div>
        <div v-if="isLoadingMembers" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-green-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-500 text-sm">Loading status data...</p>
          </div>
        </div>
        <div v-else-if="memberStatusData.length === 0" class="h-64 sm:h-80 md:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <Users class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 font-medium text-sm sm:text-base">No status data available</p>
          </div>
        </div>
        <div v-else class="h-64 sm:h-80 md:h-96 relative">
           
          <svg class="w-full h-full" :viewBox="isMobile ? '0 0 400 300' : '0 0 900 380'" ref="statusChartSvg">
            <defs>
              <filter id="statusShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>
             
            <g :transform="`translate(${isMobile ? 200 : 450}, ${isMobile ? 150 : 190})`">
              <path
                v-for="(slice, index) in pieSlices"
                :key="index"
                :d="slice.path"
                :fill="slice.color"
                :stroke="slice.color"
                stroke-width="2"
                filter="url(#statusShadow)"
                class="hover:opacity-80 transition-all duration-300 cursor-pointer"
                @mouseenter="showStatusTooltip($event, slice)"
                @mouseleave="hideStatusTooltip"
              />
               
              <circle :r="isMobile ? 40 : 60" fill="white" stroke="#e5e7eb" stroke-width="2" />
              <text text-anchor="middle" dy="0" fill="#374151" :font-size="isMobile ? '12' : '14'" font-weight="bold">Total</text>
              <text text-anchor="middle" dy="15" fill="#374151" :font-size="isMobile ? '16' : '20'" font-weight="bold">{{ totalMembers }}</text>
            </g>
            
            <g v-for="(slice, index) in pieSlices" :key="'label' + index">
              <line
                :x1="(isMobile ? 200 : 450) + slice.labelLine.x1"
                :y1="(isMobile ? 150 : 190) + slice.labelLine.y1"
                :x2="(isMobile ? 200 : 450) + slice.labelLine.x2"
                :y2="(isMobile ? 150 : 190) + slice.labelLine.y2"
                stroke="#6b7280"
                stroke-width="1"
              />
              <text
                :x="(isMobile ? 200 : 450) + slice.labelLine.x2 + (slice.labelLine.x2 > 0 ? 5 : -5)"
                :y="(isMobile ? 150 : 190) + slice.labelLine.y2 + 5"
                :text-anchor="slice.labelLine.x2 > 0 ? 'start' : 'end'"
                fill="#374151"
                :font-size="isMobile ? '10' : '12'"
                font-weight="500"
              >
                {{ isMobile ? slice.status.substring(0, 8) : slice.status }} ({{ slice.count }})
              </text>
            </g>
          </svg>
          
          <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white bg-opacity-95 rounded-md sm:rounded-lg p-2 sm:p-4 shadow-lg border border-gray-200">
            <div class="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Status Legend</div>
            <div class="space-y-1 sm:space-y-2">
              <div v-for="(status, index) in memberStatusData" :key="index" class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-3 h-3 sm:w-4 sm:h-4 rounded" :style="`background-color: ${getStatusColor(status.status)}`"></div>
                <span class="text-xs font-medium text-gray-700">{{ status.status }}</span>
                <span class="text-xs text-gray-500">({{ ((status.count / totalMembers) * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

     
    <div class="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">Recent Attendance Forms</h2>
          <p class="text-xs sm:text-sm text-gray-500">Latest form submissions and their current status</p>
        </div>
        <button class="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-100 transition-colors">
          View All
          <ExternalLink class="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
        </button>
      </div>
      <div v-if="isLoadingAttendance" class="flex items-center justify-center py-8 sm:py-12">
        <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-purple-500 border-t-transparent"></div>
      </div>
      <div v-else-if="attendanceError" class="py-8 sm:py-12">
        <p class="text-red-500 text-center font-medium text-sm">{{ attendanceError }}</p>
      </div>
      <div v-else-if="attendanceForms.length === 0" class="py-8 sm:py-12">
        <div class="text-center">
          <FileText class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 font-medium text-sm sm:text-base">No attendance forms found</p>
          <p class="text-xs sm:text-sm text-gray-400 mt-2">Create your first attendance form to get started</p>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
              <th class="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responses</th>
              <th class="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Location</th>
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
              <td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div class="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">{{ form.eventName }}</div>
                <div v-if="form.eventDescription" class="text-xs text-gray-500 truncate max-w-32 sm:max-w-xs">
                  {{ form.eventDescription }}
                </div>
              </td>
              <td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div class="text-xs sm:text-sm text-gray-900">{{ formatDate(form.eventDate) }}</div>
                <div class="text-xs text-gray-500 hidden sm:block">Created: {{ formatDate(form.createdAt) }}</div>
              </td>
              <td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                <span :class="{
                  'px-2 py-1 text-xs font-medium rounded-full': true,
                  'bg-green-100 text-green-800': getFormStatus(form) === 'active',
                  'bg-blue-100 text-blue-800': getFormStatus(form) === 'upcoming',
                  'bg-gray-100 text-gray-800': getFormStatus(form) === 'closed'
                }">
                  {{ getFormStatus(form).charAt(0).toUpperCase() + getFormStatus(form).slice(1) }}
                </span>
              </td>
              <td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-xs sm:text-sm font-medium text-gray-900">{{ getResponseCount(form.id) }}</span>
                  <div class="ml-2 w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div class="bg-blue-500 h-1.5 sm:h-2 rounded-full" :style="`width: ${Math.min((getResponseCount(form.id) / maxResponses) * 100, 100)}%`"></div>
                  </div>
                </div>
              </td>
              <td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                {{ form.eventLocation || 'Not specified' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

   
    <div 
      v-if="tooltip.show"
      class="fixed z-50 bg-gray-900 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl max-w-xs sm:max-w-sm pointer-events-none border border-gray-700"
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

     
    <div 
      v-if="resourceTooltip.show"
      class="fixed z-50 bg-gray-900 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl max-w-xs sm:max-w-sm pointer-events-none border border-gray-700"
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

     
    <div 
      v-if="memberTooltip.show"
      class="fixed z-50 bg-gray-900 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl max-w-xs sm:max-w-sm pointer-events-none border border-gray-700"
      :style="{ left: memberTooltip.x + 'px', top: memberTooltip.y + 'px' }"
    >
      <div class="text-sm font-semibold mb-2 text-green-300">Member Registration</div>
      <div class="text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-gray-300">Month:</span>
          <span class="text-white font-medium">{{ memberTooltip.data.month }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">New Members:</span>
          <span class="text-white font-medium">{{ memberTooltip.data.count }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Cumulative:</span>
          <span class="text-white font-medium">{{ memberTooltip.data.cumulative }}</span>
        </div>
      </div>
    </div>

      
    <div 
      v-if="statusTooltip.show"
      class="fixed z-50 bg-gray-900 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl max-w-xs sm:max-w-sm pointer-events-none border border-gray-700"
      :style="{ left: statusTooltip.x + 'px', top: statusTooltip.y + 'px' }"
    >
      <div class="text-sm font-semibold mb-2 text-green-300">{{ statusTooltip.data.status }} Members</div>
      <div class="text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-gray-300">Count:</span>
          <span class="text-white font-medium">{{ statusTooltip.data.count }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Percentage:</span>
          <span class="text-white font-medium">{{ statusTooltip.data.percentage }}%</span>
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

// Responsive breakpoint detection
const isMobile = ref(false);

// State
const isLoading = ref(true);
const error = ref(null);
const currentBarangay = ref('');
const totalMembers = ref(0);
const membersLastMonth = ref(0);

// Member Analytics State
const allMembers = ref([]);
const isLoadingMembers = ref(true);
const memberError = ref(null);
const selectedMemberYear = ref(new Date().getFullYear());

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

// Member tooltip state
const memberTooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null
});

// Status tooltip state
const statusTooltip = ref({
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

// Responsive detection
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// FIXED: Calculate active resources from the actual resource data
const activeResources = computed(() => {
  return availableResources.value.reduce((sum, resource) => {
    return sum + (resource.remainingQuantity || 0);
  }, 0);
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

// Available member years
const availableMemberYears = computed(() => {
  const years = new Set();
  allMembers.value.forEach(member => {
    if (member.createdAt) {
      const date = member.createdAt instanceof Timestamp 
        ? member.createdAt.toDate()
        : new Date(member.createdAt);
      years.add(date.getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a);
});

// Member registration data by month
const memberRegistrationData = computed(() => {
  if (!allMembers.value.length) return [];
  const monthlyData = {};
  let cumulative = 0;

  // Filter members by selected year
  const yearMembers = allMembers.value.filter(member => {
    if (!member.createdAt) return false;
    const date = member.createdAt instanceof Timestamp 
      ? member.createdAt.toDate()
      : new Date(member.createdAt);
    return date.getFullYear() === selectedMemberYear.value;
  });

  // Sort by creation date
  yearMembers.sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateA - dateB;
  });

  // Group by month
  yearMembers.forEach(member => {
    const date = member.createdAt instanceof Timestamp 
      ? member.createdAt.toDate()
      : new Date(member.createdAt);
      
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        monthShort: monthShort,
        date: date,
        count: 0,
        cumulative: 0
      };
    }
    monthlyData[monthKey].count++;
  });

  // Calculate cumulative and convert to array
  const result = Object.values(monthlyData).sort((a, b) => a.date - b.date);
  
  result.forEach(monthData => {
    cumulative += monthData.count;
    monthData.cumulative = cumulative;
  });

  return result;
});

// Member status distribution
const memberStatusData = computed(() => {
  if (!allMembers.value.length) return [];
  const statusCounts = {};
  
  allMembers.value.forEach(member => {
    const status = member.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: ((count / allMembers.value.length) * 100).toFixed(1)
  }));
});

// Chart points for member registration line chart
const memberChartPoints = computed(() => {
  if (memberRegistrationData.value.length === 0) return [];
  const width = isMobile.value ? 320 : 740;
  const height = isMobile.value ? 240 : 300;
  const baseX = isMobile.value ? 40 : 80;
  const baseY = isMobile.value ? 280 : 350;

  return memberRegistrationData.value.map((monthData, index) => {
    const x = baseX + (index * (width / Math.max(memberRegistrationData.value.length - 1, 1)));
    const y = baseY - (monthData.count / maxMemberCount.value) * height;
    return {
      x: x,
      y: y,
      month: monthData.monthShort,
      count: monthData.count,
      cumulative: monthData.cumulative,
      monthData: monthData
    };
  });
});

// Max member count for chart scaling
const maxMemberCount = computed(() => {
  if (memberRegistrationData.value.length === 0) return 10;
  return Math.max(...memberRegistrationData.value.map(data => data.count), 1);
});

// Yearly member statistics
const yearlyMemberTotal = computed(() => {
  return memberRegistrationData.value.reduce((sum, data) => sum + data.count, 0);
});

const averageMonthlyMembers = computed(() => {
  if (memberRegistrationData.value.length === 0) return 0;
  return Math.round(yearlyMemberTotal.value / memberRegistrationData.value.length);
});

const peakMonth = computed(() => {
  if (memberRegistrationData.value.length === 0) return 'N/A';
  const peak = memberRegistrationData.value.reduce((max, data) => 
    data.count > max.count ? data : max, memberRegistrationData.value[0]);
  return peak.monthShort;
});

// Pie chart slices for status distribution
const pieSlices = computed(() => {
  if (memberStatusData.value.length === 0) return [];
  let currentAngle = 0;
  const radius = isMobile.value ? 80 : 120;

  return memberStatusData.value.map((statusData, index) => {
    const percentage = statusData.count / allMembers.value.length;
    const angle = percentage * 2 * Math.PI;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');

    // Label line
    const midAngle = startAngle + angle / 2;
    const labelRadius = radius + (isMobile.value ? 20 : 30);
    const labelX = Math.cos(midAngle) * labelRadius;
    const labelY = Math.sin(midAngle) * labelRadius;

    currentAngle = endAngle;

    return {
      path,
      color: getStatusColor(statusData.status),
      status: statusData.status,
      count: statusData.count,
      percentage: statusData.percentage,
      labelLine: {
        x1: Math.cos(midAngle) * radius,
        y1: Math.sin(midAngle) * radius,
        x2: labelX,
        y2: labelY
      }
    };
  });
});

// FIXED: Stats data with properly synchronized active resources
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
    value: activeResources.value.toLocaleString(), // FIXED: Now uses computed activeResources
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

  const width = isMobile.value ? 320 : 740;
  const height = isMobile.value ? 240 : 300;
  const baseX = isMobile.value ? 40 : 80;
  const baseY = isMobile.value ? 280 : 350;

  return forms.map((form, index) => {
    const x = baseX + (index * (width / Math.max(forms.length - 1, 1)));
    const responses = getResponseCount(form.id);
    const y = baseY - (responses / maxResponses.value) * height;

    return {
      x: x,
      y: y,
      form: form,
      responses: responses
    };
  });
});

// Responsive chart helper functions
const getResponsiveBarX = (monthIndex, typeIndex, totalTypes) => {
  const width = isMobile.value ? 320 : 740;
  const baseX = isMobile.value ? 40 : 80;
  const monthWidth = width / Math.max(filteredMonthlyData.value.length, 1);
  const barWidth = getResponsiveBarWidth(totalTypes);
  const monthStart = baseX + (monthIndex * monthWidth);
  const groupStart = monthStart + (monthWidth - (barWidth * totalTypes)) / 2;
  return groupStart + (typeIndex * barWidth);
};

const getResponsiveBarY = (quantity) => {
  const height = isMobile.value ? 240 : 300;
  const baseY = isMobile.value ? 280 : 350;
  return baseY - (quantity / maxResourceQuantity.value) * height;
};

const getResponsiveBarWidth = (totalTypes) => {
  const width = isMobile.value ? 320 : 740;
  const monthWidth = width / Math.max(filteredMonthlyData.value.length, 1);
  const maxBarWidth = isMobile.value ? 30 : 50;
  return Math.min(maxBarWidth / Math.max(totalTypes, 1), monthWidth * 0.7 / Math.max(totalTypes, 1));
};

const getResponsiveBarHeight = (quantity) => {
  const height = isMobile.value ? 240 : 300;
  return (quantity / maxResourceQuantity.value) * height;
};

// Responsive path generation
const getResponsiveLinePath = () => {
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

const getResponsiveAreaPath = () => {
  if (enhancedChartPoints.value.length === 0) return '';
  let path = getResponsiveLinePath();
  if (enhancedChartPoints.value.length > 0) {
    const baseY = isMobile.value ? 280 : 350;
    path += ` L ${enhancedChartPoints.value[enhancedChartPoints.value.length - 1].x} ${baseY}`;
    path += ` L ${enhancedChartPoints.value[0].x} ${baseY} Z`;
  }
  return path;
};

// Member chart path generation
const getResponsiveMemberLinePath = () => {
  if (memberChartPoints.value.length === 0) return '';
  let path = `M ${memberChartPoints.value[0].x} ${memberChartPoints.value[0].y}`;

  for (let i = 1; i < memberChartPoints.value.length; i++) {
    const prevPoint = memberChartPoints.value[i - 1];
    const currPoint = memberChartPoints.value[i];
    // Create smooth curves
    const cpx1 = prevPoint.x + (currPoint.x - prevPoint.x) / 3;
    const cpy1 = prevPoint.y;
    const cpx2 = currPoint.x - (currPoint.x - prevPoint.x) / 3;
    const cpy2 = currPoint.y;
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${currPoint.x} ${currPoint.y}`;
  }

  return path;
};

const getResponsiveMemberAreaPath = () => {
  if (memberChartPoints.value.length === 0) return '';
  let path = getResponsiveMemberLinePath();
  if (memberChartPoints.value.length > 0) {
    const baseY = isMobile.value ? 280 : 350;
    path += ` L ${memberChartPoints.value[memberChartPoints.value.length - 1].x} ${baseY}`;
    path += ` L ${memberChartPoints.value[0].x} ${baseY} Z`;
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

const getStatusColor = (status) => {
  if (typeof status === 'undefined') {
    switch (selectedStatus.value) {
      case 'active': return '#10B981';
      case 'upcoming': return '#3B82F6';
      case 'closed': return '#6B7280';
      default: return '#8B5CF6';
    }
  }
  // For member status colors
  switch (status) {
    case 'Active': return '#10B981';
    case 'Blocked': return '#EF4444';
    case 'Pending': return '#F59E0B';
    default: return '#6B7280';
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

// Member tooltip functions
const showMemberTooltip = (event, point) => {
  memberTooltip.value = {
    show: true,
    x: event.clientX + 15,
    y: event.clientY - 10,
    data: {
      month: point.monthData.month,
      count: point.count,
      cumulative: point.cumulative
    }
  };
};

const hideMemberTooltip = () => {
  memberTooltip.value.show = false;
};

// Status tooltip functions
const showStatusTooltip = (event, slice) => {
  statusTooltip.value = {
    show: true,
    x: event.clientX + 15,
    y: event.clientY - 10,
    data: slice
  };
};

const hideStatusTooltip = () => {
  statusTooltip.value.show = false;
};

// FIXED: Data fetching functions with proper resource calculation
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
      // REMOVED: activeResources.value assignment - now using computed property
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
    const memberHistoryCollection = collection(db, 'member_history'); // Updated to match your collection name
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

// Fetch all members for analytics
const fetchAllMembers = async () => {
  if (!currentBarangay.value) return;
  isLoadingMembers.value = true;
  memberError.value = null;

  try {
    // Fetch active members
    const activeUsersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentBarangay.value),
      where('role', '==', 'Member'),
      where('status', '==', 'Active')
    );

    // Fetch blocked members
    const blockedMembersQuery = query(
      collection(db, 'blocked_members'),
      where('barangay', '==', currentBarangay.value)
    );

    const [activeSnapshot, blockedSnapshot] = await Promise.all([
      getDocs(activeUsersQuery),
      getDocs(blockedMembersQuery)
    ]);

    const members = [];

    // Add active members
    activeSnapshot.forEach(doc => {
      members.push({
        id: doc.id,
        ...doc.data(),
        status: 'Active'
      });
    });

    // Add blocked members
    blockedSnapshot.forEach(doc => {
      members.push({
        id: doc.id,
        ...doc.data(),
        status: 'Blocked'
      });
    });

    allMembers.value = members;
    totalMembers.value = activeSnapshot.docs.length; // Only count active members for total
    isLoadingMembers.value = false;
  } catch (error) {
    console.error('Error fetching all members:', error);
    memberError.value = 'Failed to load member data: ' + error.message;
    isLoadingMembers.value = false;
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

    // Fetch all members for analytics
    await fetchAllMembers();
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
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  const unsubscribe = await fetchTotalMembers();
  return () => {
    if (unsubscribe) unsubscribe();
    window.removeEventListener('resize', checkMobile);
  };
});

// Watchers
watch([selectedResourceType, selectedYear], () => {
  selectedMonth.value = null;
});

watch([selectedStatus, attendanceTimeRange], () => {
  selectedForm.value = null;
});

// Watch for member year changes
watch(selectedMemberYear, () => {
  // Optionally refetch data or update charts when year changes
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
  height: 6px;
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
@media (max-width: 640px) {
  .text-3xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .gap-6 {
    gap: 0.75rem;
  }
  
  .mb-8 {
    margin-bottom: 1.5rem;
  }
  
  .px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-4 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .gap-4 {
    gap: 0.5rem;
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

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .xl\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  /* Ensure charts are properly sized on mobile */
  svg {
    max-width: 100%;
    height: auto;
  }
  
  /* Optimize tooltip positioning on mobile */
  .fixed {
    position: fixed !important;
    z-index: 9999;
  }
  
  /* Better touch targets */
  button, select, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .h-64 {
    height: 12rem;
  }
  
  .h-80 {
    height: 14rem;
  }
  
  .h-96 {
    height: 16rem;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  svg {
    shape-rendering: geometricPrecision;
  }
}
</style>
