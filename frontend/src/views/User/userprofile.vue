<template>
  <div class="profile-container">
    <!-- Back Button -->
    <div class="back-button-container">
      <router-link to="/userdash" class="back-button">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Dashboard</span>
      </router-link>
    </div>
    
    <!-- Cover Photo Section -->
    <div class="cover-photo-container">
      <div class="cover-photo">
        <img :src="user.coverPhoto || defaultCoverPhoto" alt="Cover Photo">
        <button class="edit-cover-btn">
          <i class="pi pi-camera"></i> Edit Cover
        </button>
      </div>
      
      <!-- Profile Picture -->
      <div class="profile-picture-container">
        <div class="profile-picture">
          <img :src="user.profilePicture || defaultProfilePicture" alt="Profile Picture">
          <div class="profile-picture-edit">
            <i class="pi pi-camera"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Profile Info Section -->
    <div class="profile-info-container">
      <div class="profile-name-section">
        <h1>{{ user.name }}</h1>
        <p class="profile-tagline">{{ user.tagline || 'Solo Parent' }}</p>
        <div class="profile-badges">
          <span class="badge verified" v-if="user.isVerified">
            <i class="pi pi-check-circle"></i> Verified
          </span>
          <span class="badge member-since">
            <i class="pi pi-calendar"></i> Member since {{ formatDate(user.memberSince) }}
          </span>
        </div>
      </div>
      
      <div class="profile-actions">
        <button class="action-btn primary">
          <i class="pi pi-pencil"></i> Edit Profile
        </button>
        <button class="action-btn">
          <i class="pi pi-cog"></i> Settings
        </button>
      </div>
    </div>
    
    <!-- Profile Navigation -->
    <div class="profile-nav">
      <div class="nav-container">
        <div 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="['pi', tab.icon]"></i>
          <span>{{ tab.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- Profile Content -->
    <div class="profile-content">
      <!-- About Section -->
      <div v-if="activeTab === 'about'" class="about-section">
        <div class="content-card">
          <div class="card-header">
            <h2><i class="pi pi-user"></i> Personal Information</h2>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-home"></i>
              </div>
              <div>
                <p class="info-label">Barangay</p>
                <p class="info-value">{{ user.barangay || 'Not specified' }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-phone"></i>
              </div>
              <div>
                <p class="info-label">Contact Number</p>
                <p class="info-value">{{ user.contactNumber || 'Not specified' }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-envelope"></i>
              </div>
              <div>
                <p class="info-label">Email</p>
                <p class="info-value">{{ user.email || 'Not specified' }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div>
                <p class="info-label">Birthday</p>
                <p class="info-value">{{ formatDate(user.birthday) || 'Not specified' }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-users"></i>
              </div>
              <div>
                <p class="info-label">Number of Children</p>
                <p class="info-value">{{ user.childrenCount || '0' }}</p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-briefcase"></i>
              </div>
              <div>
                <p class="info-label">Occupation</p>
                <p class="info-value">{{ user.occupation || 'Not specified' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-card">
          <div class="card-header">
            <h2><i class="pi pi-heart"></i> Family</h2>
            <button class="card-action" v-if="user.children && user.children.length > 0">
              <i class="pi pi-plus"></i> Add Child
            </button>
          </div>
          
          <div v-if="user.children && user.children.length > 0" class="children-grid">
            <div v-for="(child, index) in user.children" :key="index" class="child-card">
              <div class="child-avatar">
                <span>{{ getInitials(child.name) }}</span>
              </div>
              <div class="child-info">
                <h3>{{ child.name }}</h3>
                <p>{{ child.age }} years old</p>
              </div>
              <div class="child-actions">
                <button class="icon-btn">
                  <i class="pi pi-pencil"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-users"></i>
            </div>
            <p>No children information added yet.</p>
            <button class="action-btn small">
              <i class="pi pi-plus"></i> Add Child
            </button>
          </div>
        </div>
      </div>
      
      <!-- Photos Section -->
      <div v-if="activeTab === 'photos'" class="photos-section">
        <div class="content-card">
          <div class="card-header">
            <h2><i class="pi pi-images"></i> Photos</h2>
            <button class="card-action">
              <i class="pi pi-upload"></i> Upload
            </button>
          </div>
          
          <div class="photos-grid" v-if="photos.length > 0">
            <div v-for="(photo, index) in photos" :key="index" class="photo-item">
              <img :src="photo.url" alt="Photo">
              <div class="photo-overlay">
                <div class="photo-date">{{ formatDate(photo.timestamp) }}</div>
                <div class="photo-caption">{{ photo.caption }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-images"></i>
            </div>
            <p>No photos uploaded yet.</p>
            <button class="action-btn small">
              <i class="pi pi-upload"></i> Upload Photos
            </button>
          </div>
        </div>
      </div>
      
      <!-- Resources Section -->
      <div v-if="activeTab === 'resources'" class="resources-section">
        <div class="content-card">
          <div class="card-header">
            <h2><i class="pi pi-box"></i> My Resources</h2>
            <button class="card-action" @click="$router.push('/request')">
              <i class="pi pi-plus"></i> Request
            </button>
          </div>
          
          <div class="resources-list" v-if="resources.length > 0">
            <div v-for="(resource, index) in resources" :key="index" class="resource-card">
              <div class="resource-icon">
                <i :class="['pi', getResourceIcon(resource.type)]"></i>
              </div>
              <div class="resource-info">
                <h3>{{ resource.name }}</h3>
                <p>{{ resource.description }}</p>
                <div class="resource-meta">
                  <span class="resource-type">{{ resource.type }}</span>
                  <span class="resource-date">
                    <i class="pi pi-calendar"></i> 
                    {{ resource.dateReceived ? formatDate(resource.dateReceived) : 'Pending' }}
                  </span>
                </div>
              </div>
              <div class="resource-status" :class="resource.status">
                {{ resource.status }}
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-box"></i>
            </div>
            <p>No resources received yet.</p>
            <button class="action-btn small" @click="$router.push('/request')">
              <i class="pi pi-plus"></i> Request Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export default {
  data() {
    return {
      defaultProfilePicture: 'https://via.placeholder.com/150?text=Profile',
      defaultCoverPhoto: 'https://via.placeholder.com/1000x350/6a0dad/ffffff?text=Solo+Parent+Federation',
      user: {
        id: null,
        name: 'Loading...',
        firstName: '',
        barangay: '',
        email: '',
        contactNumber: '',
        birthday: null,
        memberSince: new Date(),
        isVerified: false,
        profilePicture: null,
        coverPhoto: null,
        tagline: '',
        occupation: '',
        childrenCount: 0,
        children: []
      },
      activeTab: 'about',
      tabs: [
        { id: 'about', name: 'About', icon: 'pi-user' },
        { id: 'photos', name: 'Photos', icon: 'pi-images' },
        { id: 'resources', name: 'Resources', icon: 'pi-box' }
      ],
      photos: [],
      resources: []
    };
  },
  created() {
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userId) {
      this.user.id = userId;
      this.fetchUserData();
      this.fetchUserPhotos();
      this.fetchUserResources();
    } else {
      // Sample data for demonstration
      this.loadSampleData();
    }
  },
  methods: {
    async fetchUserData() {
      if (!this.user.id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", this.user.id));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Update user data
          this.user = {
            ...this.user,
            name: userData.name || userData.firstName + ' ' + userData.lastName,
            firstName: userData.firstName || '',
            barangay: userData.barangay || '',
            email: userData.email || '',
            contactNumber: userData.contactNumber || '',
            birthday: userData.birthday ? userData.birthday.toDate() : null,
            memberSince: userData.createdAt ? userData.createdAt.toDate() : new Date(),
            isVerified: userData.isVerified || false,
            profilePicture: userData.profilePicture || null,
            coverPhoto: userData.coverPhoto || null,
            tagline: userData.tagline || 'Solo Parent',
            occupation: userData.occupation || '',
            childrenCount: userData.childrenCount || 0
          };
          
          // Fetch children data if available
          if (userData.hasChildren) {
            this.fetchChildrenData();
          }
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
        this.loadSampleData();
      }
    },
    async fetchChildrenData() {
      if (!this.user.id) return;
      
      try {
        const childrenRef = collection(db, `users/${this.user.id}/children`);
        const childrenSnapshot = await getDocs(childrenRef);
        
        this.user.children = childrenSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            age: this.calculateAge(data.birthdate?.toDate())
          };
        });
      } catch (error) {
        console.error("❌ Error fetching children data:", error);
      }
    },
    async fetchUserPhotos() {
      if (!this.user.id) return;
      
      try {
        const photosRef = collection(db, `users/${this.user.id}/photos`);
        const photosSnapshot = await getDocs(photosRef);
        
        this.photos = photosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            url: data.url,
            timestamp: data.timestamp?.toDate() || new Date(),
            caption: data.caption || ''
          };
        });
      } catch (error) {
        console.error("❌ Error fetching photos:", error);
        // Load sample photos
        this.loadSamplePhotos();
      }
    },
    async fetchUserResources() {
      if (!this.user.id) return;
      
      try {
        const resourcesRef = collection(db, "requests");
        const q = query(
          resourcesRef,
          where("userId", "==", this.user.id),
          orderBy("dateRequested", "desc")
        );
        
        const resourcesSnapshot = await getDocs(q);
        
        this.resources = resourcesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.resourceName || 'Resource',
            type: data.resourceType || 'Other',
            description: data.description || 'No description',
            status: data.status || 'pending',
            dateRequested: data.dateRequested?.toDate() || new Date(),
            dateReceived: data.dateReceived?.toDate() || null
          };
        });
      } catch (error) {
        console.error("❌ Error fetching resources:", error);
        // Load sample resources
        this.loadSampleResources();
      }
    },
    formatDate(date) {
      if (!date) return 'Not specified';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    calculateAge(birthdate) {
      if (!birthdate) return 0;
      
      const today = new Date();
      const birthDate = new Date(birthdate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    },
    getResourceIcon(type) {
      const icons = {
        'Food': 'pi-shopping-bag',
        'Supplies': 'pi-box',
        'Money': 'pi-wallet',
        'Medical': 'pi-heart',
        'Education': 'pi-book'
      };
      
      return icons[type] || 'pi-box';
    },
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    loadSampleData() {
      // Sample user data for demonstration
      this.user = {
        id: 'sample',
        name: 'Maria Santos',
        firstName: 'Maria',
        barangay: 'Barangay 123',
        email: 'maria.santos@example.com',
        contactNumber: '09123456789',
        birthday: new Date(1985, 5, 15),
        memberSince: new Date(2022, 1, 10),
        isVerified: true,
        profilePicture: 'https://via.placeholder.com/150?text=Maria',
        coverPhoto: 'https://via.placeholder.com/1000x350/6a0dad/ffffff?text=Solo+Parent+Federation',
        tagline: 'Proud solo parent of 2 wonderful children',
        occupation: 'Administrative Assistant',
        childrenCount: 2,
        children: [
          { id: 'c1', name: 'Juan Santos', age: 10 },
          { id: 'c2', name: 'Ana Santos', age: 7 }
        ]
      };
      
      this.loadSamplePhotos();
      this.loadSampleResources();
    },
    loadSamplePhotos() {
      // Sample photos for demonstration
      this.photos = [
        {
          id: 'ph1',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+1',
          timestamp: new Date(Date.now() - 86400000 * 5),
          caption: 'Community event'
        },
        {
          id: 'ph2',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+2',
          timestamp: new Date(Date.now() - 86400000 * 10),
          caption: 'Family day'
        },
        {
          id: 'ph3',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+3',
          timestamp: new Date(Date.now() - 86400000 * 15),
          caption: 'Workshop'
        },
        {
          id: 'ph4',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+4',
          timestamp: new Date(Date.now() - 86400000 * 20),
          caption: 'Kids activity'
        },
        {
          id: 'ph5',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+5',
          timestamp: new Date(Date.now() - 86400000 * 25),
          caption: 'Seminar'
        },
        {
          id: 'ph6',
          url: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Photo+6',
          timestamp: new Date(Date.now() - 86400000 * 30),
          caption: 'Birthday celebration'
        }
      ];
    },
    loadSampleResources() {
      // Sample resources for demonstration
      this.resources = [
        {
          id: 'r1',
          name: 'School Supplies Package',
          type: 'Supplies',
          description: 'Notebooks, pencils, pens, and other school materials',
          status: 'approved',
          dateRequested: new Date(Date.now() - 86400000 * 15),
          dateReceived: new Date(Date.now() - 86400000 * 10)
        },
        {
          id: 'r2',
          name: 'Food Assistance',
          type: 'Food',
          description: 'Monthly grocery package with rice, canned goods, and other essentials',
          status: 'approved',
          dateRequested: new Date(Date.now() - 86400000 * 35),
          dateReceived: new Date(Date.now() - 86400000 * 30)
        },
        {
          id: 'r3',
          name: 'Medical Assistance',
          type: 'Medical',
          description: 'Financial assistance for medical check-up',
          status: 'pending',
          dateRequested: new Date(Date.now() - 86400000 * 5),
          dateReceived: null
        }
      ];
    }
  }
};
</script>

<style scoped>
/* Profile Container */
.profile-container {
  background-color: #f5f0fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* Back Button */
.back-button-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #6a0dad;
  border: none;
  border-radius: 30px;
  padding: 10px 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Cover Photo Section */
.cover-photo-container {
  position: relative;
  margin-bottom: 80px;
}

.cover-photo {
  position: relative;
  height: 350px;
  overflow: hidden;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cover-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-cover-btn {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.edit-cover-btn:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Profile Picture */
.profile-picture-container {
  position: absolute;
  bottom: -70px;
  left: 50px;
}

.profile-picture {
  position: relative;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 6px solid white;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-edit {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #6a0dad;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(106, 13, 173, 0.4);
  transition: transform 0.2s;
}

.profile-picture-edit:hover {
  transform: scale(1.1);
}

/* Profile Info Section */
.profile-info-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 50px 20px;
  margin-bottom: 15px;
}

.profile-name-section h1 {
  font-size: 32px;
  margin: 0 0 5px 0;
  color: #1c1e21;
  font-weight: 700;
}

.profile-tagline {
  font-size: 16px;
  color: #65676b;
  margin: 0 0 12px 0;
}

.profile-badges {
  display: flex;
  gap: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 30px;
  background: #f0f2f5;
  color: #65676b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.badge.verified {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.member-since {
  background: #e8eaf6;
  color: #3949ab;
}

.profile-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  background: #f0f2f5;
  color: #050505;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  background: #e4e6eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: #6a0dad;
  color: white;
  box-shadow: 0 2px 8px rgba(106, 13, 173, 0.3);
}

.action-btn.primary:hover {
  background: #5a0b8d;
  box-shadow: 0 4px 12px rgba(106, 13, 173, 0.4);
}

.action-btn.small {
  font-size: 13px;
  padding: 8px 14px;
}

/* Profile Navigation */
.profile-nav {
  background: white;
  border-radius: 12px;
  margin: 0 20px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-container {
  display: flex;
  padding: 0 10px;
}

.nav-item {
  padding: 16px 20px;
  font-weight: 600;
  color: #65676b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: color 0.2s;
  border-radius: 8px;
  margin: 5px;
}

.nav-item:hover {
  background-color: #f5f0fa;
  color: #6a0dad;
}

.nav-item.active {
  color: #6a0dad;
  background-color: #f5f0fa;
}

.nav-item i {
  font-size: 18px;
}

/* Profile Content */
.profile-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.content-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header h2 {
  font-size: 20px;
  margin: 0;
  color: #1c1e21;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header h2 i {
  color: #6a0dad;
}

.card-action {
  background: #f5f0fa;
  color: #6a0dad;
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-action:hover {
  background: #e8d8f3;
  transform: translateY(-2px);
}

/* About Section */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 25px;
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a0dad;
  flex-shrink: 0;
}

.info-label {
  font-size: 14px;
  color: #65676b;
  margin: 0 0 5px 0;
}

.info-value {
  font-size: 16px;
  color: #1c1e21;
  margin: 0;
  font-weight: 500;
}

/* Children Section */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 25px;
}

.child-card {
  background: #f5f0fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s;
}

.child-card:hover {
  transform: translateY(-5px);
}

.child-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #6a0dad;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
}

.child-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.child-info p {
  margin: 0;
  color: #65676b;
  font-size: 14px;
}

.child-actions {
  margin-top: 15px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a0dad;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.icon-btn:hover {
  background: #6a0dad;
  color: white;
  transform: scale(1.1);
}

/* Photos Section */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 25px;
}

.photo-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 15px 10px 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-date {
  font-size: 12px;
  opacity: 0.8;
}

.photo-caption {
  font-size: 14px;
  font-weight: 500;
  margin-top: 3px;
}

/* Resources Section */
.resources-list {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f0fa;
  border-radius: 12px;
  align-items: center;
  transition: transform 0.2s;
}

.resource-card:hover {
  transform: translateY(-3px);
}

.resource-icon {
  width: 60px;
  height: 60px;
  background: #6a0dad;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
}

.resource-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.resource-info p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #65676b;
}

.resource-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.resource-type {
  background: white;
  padding: 5px 10px;
  border-radius: 30px;
  color: #6a0dad;
  font-size: 13px;
  font-weight: 600;
}

.resource-date {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #65676b;
  font-size: 13px;
}

.resource-status {
  font-weight: 600;
  font-size: 14px;
  padding: 5px 12px;
  border-radius: 30px;
  text-transform: capitalize;
}

.resource-status.approved {
  background: #e6f7e6;
  color: #2e7d32;
}

.resource-status.pending {
  background: #fff8e1;
  color: #f57c00;
}

.resource-status.rejected {
  background: #ffebee;
  color: #c62828;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #65676b;
}

.empty-icon {
  width: 70px;
  height: 70px;
  background: #f5f0fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #6a0dad;
  margin-bottom: 15px;
}

.empty-state p {
  margin-bottom: 15px;
  font-size: 16px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .profile-info-container {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 20px 20px;
  }
  
  .profile-actions {
    margin-top: 15px;
    width: 100%;
  }
  
  .profile-picture-container {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .nav-container {
    overflow-x: auto;
    padding: 0 10px;
  }
  
  .nav-item {
    padding: 15px 10px;
    white-space: nowrap;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .children-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .cover-photo {
    height: 200px;
  }
  
  .profile-picture {
    width: 120px;
    height: 120px;
  }
  
  .profile-name-section {
    text-align: center;
    width: 100%;
    margin-top: 60px;
  }
  
  .profile-badges {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .back-button span {
    display: none;
  }
  
  .back-button {
    width: 40px;
    height: 40px;
    justify-content: center;
    padding: 0;
  }
  
  .resource-card {
    flex-direction: column;
    text-align: center;
  }
  
  .resource-meta {
    justify-content: center;
  }
}
</style>