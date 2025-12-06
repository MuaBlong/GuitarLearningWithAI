import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Tạo Supabase client cho frontend
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Base URL cho API calls
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8191b256`;

// Utility function để gọi API với timeout và retry
async function apiCall(endpoint: string, options: RequestInit = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || publicAnonKey;
      
      console.log(`Making API call to: ${API_BASE}${endpoint} (attempt ${attempt + 1})`);
      
      // Tạo AbortController để có thể hủy request
      const controller = new AbortController();
      const timeoutDuration = 30000 + (attempt * 10000); // 30s + 10s mỗi lần retry
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            // THÊM TƯỜNG MINH mode: 'cors'
            mode: 'cors',
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`API response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
          console.error('API call failed:', errorMessage);
          
          // Retry on server errors (5xx) or timeout (408)
          if ((response.status >= 500 || response.status === 408) && attempt < retries) {
            console.log(`Retrying in ${2000 * (attempt + 1)}ms...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API call successful:', data);
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          if (attempt < retries) {
            console.log(`Request timeout, retrying in ${2000 * (attempt + 1)}ms...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
          throw new Error(`Yêu cầu bị timeout sau ${timeoutDuration/1000} giây`);
        }
        
        // Retry on network errors
        if (attempt < retries) {
          console.log(`Network error, retrying in ${2000 * (attempt + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        
        throw fetchError;
      }
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof Error) {
          console.error('API call error:', error.message);
          throw error;
        } else {
          console.error('Unknown API error:', error);
          throw new Error('Lỗi kết nối không xác định');
        }
      }
    }
  }
}

// =================
// AUTH API
// =================

export const authAPI = {
  // Đăng ký
  async signup(email: string, password: string, name: string) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Đăng nhập
  async signin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Đăng xuất
  async signout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // Lấy session hiện tại
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  },

  // Lấy thông tin user hiện tại
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return user;
  }
};

// =================
// PROGRESS API
// =================

export const progressAPI = {
  // Lấy tiến trình học
  async getProgress() {
    return apiCall('/progress');
  },

  // Cập nhật tiến trình
  async updateProgress(type: 'theory' | 'practice' | 'video', lessonId: string, completed: boolean, practiceTime?: number) {
    return apiCall('/progress', {
      method: 'POST',
      body: JSON.stringify({ type, lessonId, completed, practiceTime }),
    });
  }
};

// =================
// FORUM API
// =================

export const forumAPI = {
  // Lấy danh sách bài viết
  async getPosts(page = 1, limit = 10, category = 'all') {
    return apiCall(`/forum/posts?page=${page}&limit=${limit}&category=${category}`);
  },

  // Tạo bài viết mới
  async createPost(title: string, content: string, category = 'general') {
    return apiCall('/forum/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
    });
  },

  // Lấy chi tiết bài viết
  async getPost(postId: string) {
    return apiCall(`/forum/posts/${postId}`);
  },

  // Trả lời bài viết
  async replyToPost(postId: string, content: string) {
    return apiCall(`/forum/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
};

// =================
// MEDIA API
// =================

export const mediaAPI = {
  // Upload file
  async uploadFile(file: File, type: 'image' | 'video' | 'audio') {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || publicAnonKey;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      // THÊM TƯỜNG MINH mode: 'cors'
      mode: 'cors', 
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  // Lấy URL cho media
  async getMediaUrl(path: string) {
    return apiCall(`/media/${encodeURIComponent(path)}`);
  }
};

// =================
// LESSONS API
// =================

export const lessonsAPI = {
  // Lấy bài học lý thuyết
  async getTheoryLessons() {
    return apiCall('/lessons/theory');
  },

  // Lấy dữ liệu hợp âm
  async getChords() {
    return apiCall('/lessons/chords');
  },

  // Lấy video bài học
  async getVideoLessons() {
    return apiCall('/lessons/videos');
  }
};

// =================
// HEALTH CHECK API
// =================

export const healthAPI = {
  // Kiểm tra server health với logic cải thiện
  async checkHealth(maxRetries = 2) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔍 Health check attempt ${i + 1}/${maxRetries}`);
        
        const controller = new AbortController();
        const timeoutDuration = i === 0 ? 8000 : 15000; // Lần đầu 8s, lần sau 15s
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
        
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}/health`, {
          signal: controller.signal,
          // THÊM TƯỜNG MINH mode: 'cors'
          mode: 'cors',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Server is healthy (${responseTime}ms):`, data);
          return data;
        } else {
          // Nếu gặp lỗi CORS (trình duyệt chặn trước khi code này chạy), response.status sẽ là 0.
          // Lỗi CORS CHÍNH XÁC PHẢI ĐƯỢC SỬA Ở SERVER (Supabase Function)
          const errorText = await response.text().catch(() => 'No response body');
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Health check attempt ${i + 1} failed:`, errorMessage);
        
        if (i === maxRetries - 1) {
          console.error('💥 All health check attempts failed');
          throw new Error(`Server không khả dụng: ${errorMessage}`);
        }
        
        // Đợi trước khi retry, tăng dần thời gian
        const waitTime = 2000 + (i * 2000); // 2s, 4s, 6s...
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    return false;
  }
};

// =================
// NOTIFICATION HELPERS
// =================

export const notificationHelpers = {
  // Gửi thông báo khi hoàn thành bài học
  sendLessonCompleted(lessonTitle: string) {
    // Có thể tích hợp với notification system
    console.log(`Hoàn thành bài học: ${lessonTitle}`);
  },

  // Gửi thông báo khi có reply mới
  sendNewReply(postTitle: string) {
    console.log(`Có phản hồi mới trong bài viết: ${postTitle}`);
  }
};
