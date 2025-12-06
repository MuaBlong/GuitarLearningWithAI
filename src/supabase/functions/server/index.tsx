import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Tạo client Supabase cho Admin/Service Role (để tạo user, quản lý storage)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// TẠO CLIENT RIÊNG CHO CÁC TÁC VỤ CỦA NGƯỜI DÙNG (như đăng nhập),
// sử dụng Public/Anon Key để đảm bảo an toàn.
// LƯU Ý: Bạn cần cung cấp SUPABASE_ANON_KEY trong biến môi trường.
const publicSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Tạo bucket storage với cấu hình an toàn
async function initializeStorage() {
  const bucketName = 'make-8191b256-guitar-media';
  try {
    console.log('🔄 Checking storage buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'],
        fileSizeLimit: 50 * 1024 * 1024 // Giảm xuống 50MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        console.log('⚠️ Storage bucket creation failed, but server will continue');
        return false;
      } else {
        console.log(`✅ Created storage bucket: ${bucketName}`, data);
        return true;
      }
    } else {
      console.log(`✅ Storage bucket already exists: ${bucketName}`);
      return true;
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    console.log('⚠️ Storage initialization failed, but server will continue');
    return false;
  }
}

// Tạo demo user và dữ liệu mẫu
async function createDemoUser() {
  try {
    const demoEmail = 'demo@guitar.com';
    const demoPassword = 'demo123';
    const demoName = 'Guitar Demo User';
    
    // Kiểm tra nhanh xem có profile demo user chưa
    const existingProfiles = await kv.getByPrefix('profile:');
    const demoProfile = existingProfiles.find(profile => profile.email === demoEmail);
    
    if (demoProfile) {
      console.log('✅ Demo user profile already exists');
      return;
    }
    
    // Thử tạo user mới trước
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      user_metadata: { name: demoName },
      email_confirm: true
    });

    if (data?.user) {
      console.log('✅ New demo user created successfully');
      await createDemoUserData(data.user.id, demoName, demoEmail);
    } else if (error?.message?.includes('already been registered') || error?.code === 'email_exists') {
      console.log('✅ Demo user exists, profile ready');
      // User đã tồn tại, kiểm tra xem đã có profile chưa
        const { data: userData } = await supabase.auth.admin.getUserByEmail(demoEmail);
        if (userData.user && !await kv.get(`profile:${userData.user.id}`)) {
            await createDemoUserData(userData.user.id, demoName, demoEmail);
        }
    } else {
      console.error('Error creating demo user:', error?.message || error);
    }
  } catch (error) {
    console.error('Unexpected error in createDemoUser:', error);
  }
}

// Tạo dữ liệu mẫu cho demo user
async function createDemoUserData(userId: string, name: string, email: string) {
  try {
    // Tạo profile cho demo user
    await kv.set(`profile:${userId}`, {
      id: userId,
      name: name,
      email: email,
      created_at: new Date().toISOString(),
      level: 'Trung cấp',
      completed_lessons: [],
      practice_time: 0
    });

    // Tạo một số dữ liệu tiến trình mẫu cho demo user
    await kv.set(`progress:${userId}`, {
      theory_progress: {
        'lesson-1': { completed: true, completedAt: new Date().toISOString() },
        'lesson-2': { completed: true, completedAt: new Date().toISOString() },
        'lesson-3': { completed: false, completedAt: null }
      },
      practice_progress: {
        'c-major': { completed: true, completedAt: new Date().toISOString(), practiceTime: 30 },
        'g-major': { completed: true, completedAt: new Date().toISOString(), practiceTime: 25 },
        'am-minor': { completed: true, completedAt: new Date().toISOString(), practiceTime: 35 }
      },
      video_progress: {
        'video-1': { completed: true, completedAt: new Date().toISOString() },
        'video-2': { completed: false, completedAt: null }
      },
      total_practice_time: 5400, // 90 minutes in seconds
      achievements: ['first-chord', 'week-warrior']
    });

    console.log('Demo user profile data created successfully');
  } catch (error) {
    console.error('Error creating demo user data:', error);
  }
}

// Tạo dữ liệu forum mẫu
async function createSampleForumData() {
  try {
    console.log('⏳ Checking forum data...');
    
    // Kiểm tra xem đã có dữ liệu forum chưa
    const existingPosts = await kv.getByPrefix('forum:post:');
    if (existingPosts && existingPosts.length > 0) {
      console.log('✅ Forum data already exists');
      return;
    }
    
    console.log('⏳ Creating sample forum data...');

    const samplePosts = [
      {
        id: `1732509600000-demo`,
        title: 'Vừa thành thạo hợp âm F major! 🎉',
        content: 'Sau nhiều tuần luyện tập, cuối cùng mình cũng bấm được hợp âm F major một cách mượt mà! Mẹo quan trọng nhất là tập trung vào vị trí ngón tay và không vội vàng. Có ai cũng gặp khó khăn với hợp âm này không?',
        category: 'beginner',
        author: {
          id: 'demo-user',
          name: 'Sarah Chen',
          email: 'sarah@demo.com'
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 5
      },
      {
        id: `1732502400000-demo`,
        title: 'Mẹo cho người mới bắt đầu',
        content: 'Mẹo nhanh cho người mới: Khi luyện chuyển hợp âm, hãy bắt đầu RẤT chậm. Tốc độ sẽ đến tự nhiên khi cơ bắp đã có ký ức. Đừng hy sinh độ chính xác vì tốc độ! 🎸',
        category: 'tips',
        author: {
          id: 'demo-user-2',
          name: 'Mike Rodriguez',
          email: 'mike@demo.com'
        },
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 24,
        replies: 8
      },
      {
        id: `1732416000000-demo`,
        title: 'Đầu ngón tay bị đau có bình thường không?',
        content: 'Mình mới bắt đầu học một tuần và đầu ngón tay vẫn còn đau khá nhiều. Có bình thường không vậy? Mình có nên nghỉ ngơi không?',
        category: 'beginner',
        author: {
          id: 'demo-user-3',
          name: 'Emma Thompson',
          email: 'emma@demo.com'
        },
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likes: 7,
        replies: 12
      },
      {
        id: `1732329600000-demo`,
        title: 'Lịch trình luyện tập hiệu quả',
        content: 'Chia sẻ lịch trình luyện tập giúp mình tiến bộ nhanh:\n\n1. 10 phút khởi động với scales\n2. 20 phút luyện hợp âm\n3. 15 phút luyện bài hát\n4. 5 phút học lý thuyết\n\nTính kiên trì là chìa khóa! 🎯',
        category: 'tips',
        author: {
          id: 'demo-user-4',
          name: 'David Park',
          email: 'david@demo.com'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 18,
        replies: 6
      }
    ];

    // Lưu các bài viết mẫu
    const promises = samplePosts.map(post => 
      kv.set(`forum:post:${post.id}`, post)
    );
    await Promise.all(promises);

    console.log('✅ Sample forum data created successfully');
  } catch (error) {
    console.error('Error creating sample forum data:', error);
  }
}

// Tạo dữ liệu bài học mẫu
async function createSampleLessonData() {
    try {
        console.log('⏳ Creating sample lesson data...');

        // 1. Lý thuyết
        await kv.set('theory:lessons', [
            { id: 'lesson-1', title: 'Giới thiệu về Guitar & Nhạc lý cơ bản', duration: '15 phút', content: 'Cấu tạo đàn, tên dây, nhịp, phách cơ bản.' },
            { id: 'lesson-2', title: 'Hợp âm 3 nốt (Triad Chords)', duration: '20 phút', content: 'Công thức hợp âm trưởng, hợp âm thứ.' },
            { id: 'lesson-3', title: 'Kỹ thuật Petting (Quạt chả)', duration: '10 phút', content: 'Kỹ thuật quạt chả cơ bản và nâng cao.' }
        ]);

        // 2. Hợp âm thực hành
        await kv.set('practice:chords', [
            { id: 'c-major', name: 'C Major', type: 'Major', difficulty: 'Easy', image: 'https://placehold.co/100x120/E8F5E9/388E3C?text=C' },
            { id: 'g-major', name: 'G Major', type: 'Major', difficulty: 'Easy', image: 'https://placehold.co/100x120/E8F5E9/388E3C?text=G' },
            { id: 'am-minor', name: 'Am Minor', type: 'Minor', difficulty: 'Easy', image: 'https://placehold.co/100x120/FFF3E0/FFA000?text=Am' },
            { id: 'f-major', name: 'F Major', type: 'Major', difficulty: 'Hard', image: 'https://placehold.co/100x120/FFEBEE/D32F2F?text=F' }
        ]);
        
        // 3. Video bài học
        await kv.set('video:lessons', [
            { id: 'video-1', title: '10 Bài hát dễ nhất cho người mới bắt đầu', youtube_id: 'abcde123', length_sec: 600, level: 'Beginner' },
            { id: 'video-2', title: 'Cách luyện ngón hiệu quả trong 15 ngày', youtube_id: 'fghij456', length_sec: 900, level: 'Intermediate' }
        ]);

        console.log('✅ Sample lesson data created successfully');
    } catch (error) {
        console.error('Error creating sample lesson data:', error);
    }
}


// Khởi tạy server
console.log('🎸 Guitar Learning App Server is starting...');

// Khởi tạo async với timeout dài hơn và xử lý từng bước  
(async () => {
  try {
    console.log('⏳ Starting initialization...');
    
    // Step 1: Initialize storage (optional, không fail server nếu lỗi)
    try {
      const storageInitialized = await Promise.race([
        initializeStorage(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Storage timeout')), 8000)
        )
      ]);
      console.log('✅ Storage initialization:', storageInitialized ? 'Success' : 'Skipped');
    } catch (error) {
      console.warn('⚠️ Storage initialization failed:', error.message);
    }
    
    // Step 2: Create demo user (essential)
    try {
      await Promise.race([
        createDemoUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Demo user timeout')), 8000)
        )
      ]);
      console.log('✅ Demo user ready');
    } catch (error) {
      console.warn('⚠️ Demo user creation failed:', error.message);
    }

    // Step 3: Create sample lesson data
    try {
      await Promise.race([
        createSampleLessonData(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Lesson data timeout')), 8000)
        )
      ]);
      console.log('✅ Sample lesson data ready');
    } catch (error) {
      console.warn('⚠️ Lesson data creation failed:', error.message);
    }
    
    // Step 4: Create sample forum data (essential)
    try {
      await Promise.race([
        createSampleForumData(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Forum data timeout')), 8000)
        )
      ]);
      console.log('✅ Sample forum data ready');
    } catch (error) {
      console.warn('⚠️ Forum data creation failed:', error.message);
    }
    
    console.log('🎸 Server initialization complete!');
  } catch (error) {
    console.error('❌ Server initialization error:', error);
    console.log('🎸 Server will continue with basic functionality');
  }
})();

// Middleware kiểm tra xác thực
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  // Dùng publicSupabase để kiểm tra token
  const { data: { user }, error } = await publicSupabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
}

// Health check endpoint
app.get("/make-server-8191b256/health", async (c) => {
  try {
    // Simple health check without KV dependency
    const healthData = {
      status: "ok", 
      message: "Guitar Learning App Server is running",
      timestamp: new Date().toISOString(),
      server_time: Date.now(),
      version: "1.0.0"
    };

    // Test basic functionality without failing
    try {
      await kv.get('health-check');
      healthData.kv_status = "connected";
    } catch (kvError) {
      healthData.kv_status = "error";
      console.warn('KV store health check warning:', kvError.message);
    }

    return c.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({ 
      status: "degraded", 
      message: "Server is running with limited functionality",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 200); // Still return 200 but with degraded status
  }
});

// =================
// AUTH ENDPOINTS
// =================

// Đăng ký người dùng mới
app.post("/make-server-8191b256/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password và tên là bắt buộc' }, 400);
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Định dạng email không hợp lệ' }, 400);
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return c.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, 400);
    }

    // Dùng admin client để tạo user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Tự động xác nhận email vì chưa cấu hình email server
      email_confirm: true
    });

    if (error) {
      let errorMessage = 'Lỗi khi tạo tài khoản';
      if (error.message.includes('already been registered') || error.message.includes('User already registered')) {
        errorMessage = 'Email này đã được sử dụng';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Địa chỉ email không hợp lệ';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'Mật khẩu quá yếu';
      }
      return c.json({ error: errorMessage }, 400);
    }

    const user = data.user;
    
    // Tạo profile người dùng trong KV store
    await kv.set(`profile:${user.id}`, {
      id: user.id,
      name,
      email,
      created_at: new Date().toISOString(),
      level: 'Người mới bắt đầu',
      completed_lessons: [],
      practice_time: 0
    });

    // Tạo progress rỗng cho user mới
    await kv.set(`progress:${user.id}`, {
      theory_progress: {},
      practice_progress: {},
      video_progress: {},
      total_practice_time: 0,
      achievements: []
    });

    // Đăng nhập user ngay sau khi đăng ký thành công để trả về session
    const { data: sessionData, error: sessionError } = await publicSupabase.auth.signInWithPassword({ email, password });

    return c.json({ 
      message: 'Đăng ký thành công', 
      user: sessionData.user,
      session: sessionData.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Lỗi server khi đăng ký' }, 500);
  }
});

// Đăng nhập người dùng
app.post("/make-server-8191b256/auth/login", async (c) => {
    try {
        const { email, password } = await c.req.json();
        
        if (!email || !password) {
            return c.json({ error: 'Email và mật khẩu là bắt buộc' }, 400);
        }

        // Dùng public client để đăng nhập user
        const { data, error } = await publicSupabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            let errorMessage = 'Email hoặc mật khẩu không chính xác.';
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email hoặc mật khẩu không chính xác.';
            }
            return c.json({ error: errorMessage }, 401);
        }

        const user = data.user;
        const session = data.session;

        if (!user || !session) {
             return c.json({ error: 'Đăng nhập không thành công, không tìm thấy session.' }, 401);
        }

        // Kiểm tra/tạo profile nếu chưa có (ví dụ: đăng nhập bằng demo user đã được admin tạo)
        let profile = await kv.get(`profile:${user.id}`);
        if (!profile) {
            await createDemoUserData(user.id, user.user_metadata.name || user.email, user.email);
            profile = await kv.get(`profile:${user.id}`);
        }

        return c.json({
            message: 'Đăng nhập thành công',
            user: user,
            profile: profile,
            session: session,
            accessToken: session.access_token
        });

    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Lỗi server khi đăng nhập' }, 500);
    }
});


// =================
// PROGRESS ENDPOINTS
// =================

// Lấy tiến trình học của người dùng
app.get("/make-server-8191b256/progress", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile không tìm thấy' }, 404);
    }

    const progress = await kv.get(`progress:${user.id}`) || {
      theory_progress: {},
      practice_progress: {},
      video_progress: {},
      total_practice_time: 0,
      achievements: []
    };

    return c.json({ profile, progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return c.json({ error: 'Lỗi khi lấy tiến trình học' }, 500);
  }
});

// Cập nhật tiến trình học
app.post("/make-server-8191b256/progress", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { type, lessonId, completed, practiceTime } = await c.req.json();
    
    let progress = await kv.get(`progress:${user.id}`) || {
      theory_progress: {},
      practice_progress: {},
      video_progress: {},
      total_practice_time: 0,
      achievements: []
    };

    // Cập nhật tiến trình theo loại
    if (type === 'theory') {
      progress.theory_progress[lessonId] = {
        completed,
        completedAt: new Date().toISOString()
      };
    } else if (type === 'practice') {
      progress.practice_progress[lessonId] = {
        completed,
        completedAt: new Date().toISOString(),
        practiceTime: practiceTime || 0
      };
      if (practiceTime) {
        progress.total_practice_time += practiceTime;
      }
    } else if (type === 'video') {
      progress.video_progress[lessonId] = {
        completed,
        completedAt: new Date().toISOString()
      };
    }

    await kv.set(`progress:${user.id}`, progress);
    
    return c.json({ message: 'Cập nhật tiến trình thành công', progress });
  } catch (error) {
    console.error('Update progress error:', error);
    return c.json({ error: 'Lỗi khi cập nhật tiến trình' }, 500);
  }
});

// =================
// FORUM ENDPOINTS
// =================

// Lấy danh sách bài viết forum
app.get("/make-server-8191b256/forum/posts", async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const category = c.req.query('category') || 'all';
    
    const posts = await kv.getByPrefix('forum:post:');
    
    // Lọc theo category nếu cần
    const filteredPosts = category === 'all' 
      ? posts 
      : posts.filter((post: any) => post.category === category);
    
    // Sắp xếp theo thời gian tạo (mới nhất trước)
    filteredPosts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Phân trang
    const startIndex = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);
    
    return c.json({ 
      posts: paginatedPosts,
      total: filteredPosts.length,
      page,
      totalPages: Math.ceil(filteredPosts.length / limit)
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    return c.json({ error: 'Lỗi khi lấy bài viết forum' }, 500);
  }
});

// Tạo bài viết mới
app.post("/make-server-8191b256/forum/posts", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { title, content, category } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Tiêu đề và nội dung là bắt buộc' }, 400);
    }

    const postId = `${Date.now()}-${user.id}`;
    const profile = await kv.get(`profile:${user.id}`);
    
    const post = {
      id: postId,
      title,
      content,
      category: category || 'general',
      author: {
        id: user.id,
        name: profile?.name || user.email,
        email: user.email
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      replies: 0
    };

    await kv.set(`forum:post:${postId}`, post);
    
    return c.json({ message: 'Tạo bài viết thành công', post });
  } catch (error) {
    console.error('Create forum post error:', error);
    return c.json({ error: 'Lỗi khi tạo bài viết' }, 500);
  }
});

// Lấy chi tiết bài viết và replies
app.get("/make-server-8191b256/forum/posts/:postId", async (c) => {
  try {
    const postId = c.req.param('postId');
    const post = await kv.get(`forum:post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Bài viết không tìm thấy' }, 404);
    }

    const replies = await kv.getByPrefix(`forum:reply:${postId}:`);
    replies.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return c.json({ post, replies });
  } catch (error) {
    console.error('Get forum post error:', error);
    return c.json({ error: 'Lỗi khi lấy bài viết' }, 500);
  }
});

// Trả lời bài viết
app.post("/make-server-8191b256/forum/posts/:postId/replies", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const postId = c.req.param('postId');
    const { content } = await c.req.json();
    
    if (!content) {
      return c.json({ error: 'Nội dung trả lời là bắt buộc' }, 400);
    }

    const post = await kv.get(`forum:post:${postId}`);
    if (!post) {
      return c.json({ error: 'Bài viết không tìm thấy' }, 404);
    }

    const replyId = `${Date.now()}-${user.id}`;
    const profile = await kv.get(`profile:${user.id}`);
    
    const reply = {
      id: replyId,
      postId,
      content,
      author: {
        id: user.id,
        name: profile?.name || user.email,
        email: user.email
      },
      created_at: new Date().toISOString(),
      likes: 0
    };

    await kv.set(`forum:reply:${postId}:${replyId}`, reply);
    
    // Cập nhật số replies trong post
    post.replies = (post.replies || 0) + 1;
    await kv.set(`forum:post:${postId}`, post);
    
    return c.json({ message: 'Trả lời thành công', reply });
  } catch (error) {
    console.error('Create forum reply error:', error);
    return c.json({ error: 'Lỗi khi trả lời bài viết' }, 500);
  }
});

// =================
// MEDIA ENDPOINTS
// =================

// Upload media file
app.post("/make-server-8191b256/media/upload", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image', 'video', 'audio'
    
    if (!file) {
      return c.json({ error: 'File là bắt buộc' }, 400);
    }

    const fileName = `${type}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('make-8191b256-guitar-media')
      .upload(fileName, arrayBuffer, {
        contentType: file.type
      });

    if (error) {
      return c.json({ error: `Upload error: ${error.message}` }, 400);
    }

    // Tạo signed URL có thời hạn 1 năm
    const { data: urlData } = await supabase.storage
      .from('make-8191b256-guitar-media')
      .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 năm

    return c.json({ 
      message: 'Upload thành công',
      path: data.path,
      url: urlData?.signedUrl
    });
  } catch (error) {
    console.error('Upload media error:', error);
    return c.json({ error: 'Lỗi khi upload file' }, 500);
  }
});

// Lấy signed URL cho media
app.get("/make-server-8191b256/media/:path", async (c) => {
  try {
    const path = c.req.param('path');
    
    const { data, error } = await supabase.storage
      .from('make-8191b256-guitar-media')
      .createSignedUrl(path, 60 * 60); // 1 giờ

    if (error) {
      return c.json({ error: `Get media error: ${error.message}` }, 400);
    }

    return c.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Get media error:', error);
    return c.json({ error: 'Lỗi khi lấy media' }, 500);
  }
});

// =================
// LESSON DATA ENDPOINTS
// =================

// Lấy dữ liệu bài học lý thuyết
app.get("/make-server-8191b256/lessons/theory", async (c) => {
  try {
    const lessons = await kv.get('theory:lessons') || [];
    return c.json({ lessons });
  } catch (error) {
    console.error('Get theory lessons error:', error);
    return c.json({ error: 'Lỗi khi lấy bài học lý thuyết' }, 500);
  }
});

// Lấy dữ liệu hợp âm thực hành
app.get("/make-server-8191b256/lessons/chords", async (c) => {
  try {
    const chords = await kv.get('practice:chords') || [];
    return c.json({ chords });
  } catch (error) {
    console.error('Get chords error:', error);
    return c.json({ error: 'Lỗi khi lấy dữ liệu hợp âm' }, 500);
  }
});

// Lấy dữ liệu video bài học
app.get("/make-server-8191b256/lessons/videos", async (c) => {
  try {
    const videos = await kv.get('video:lessons') || [];
    return c.json({ videos });
  } catch (error) {
    console.error('Get video lessons error:', error);
    return c.json({ error: 'Lỗi khi lấy video bài học' }, 500);
  }
});

console.log('🚀 Server ready to accept connections!');
console.log('📝 Demo account: demo@guitar.com / demo123');

Deno.serve(app.fetch);
