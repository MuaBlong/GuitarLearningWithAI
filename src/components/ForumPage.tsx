import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Heart, MessageCircle, Share, Send, Loader2, Plus } from "lucide-react";
import { forumAPI, healthAPI } from "../utils/api"; // Import healthAPI
import { toast } from "sonner";
import { projectId } from "../utils/supabase/info"; // Import projectId

// Dữ liệu mẫu cho trường hợp không kết nối được server
const forumPosts = [
    {
        id: 1,
        user: { name: "Sarah Chen", avatar: "", level: "Intermediate" },
        timestamp: "2 giờ trước",
        content: "Vừa thành thạo hợp âm F major sau nhiều tuần luyện tập! 🎉 Mẹo quan trọng nhất là tập trung vào vị trí ngón tay và không vội vàng. Có ai cũng gặp khó khăn với hợp âm này không?",
        likes: 12,
        comments: 5,
        tags: ["beginner", "chords", "achievement"],
        title: "Vừa thành thạo hợp âm F Major! 🎉",
        category: "beginner"
    },
    {
        id: 2, 	
        user: { name: "Mike Rodriguez", avatar: "", level: "Advanced" },
        timestamp: "4 giờ trước",
        content: "Mẹo nhanh cho người mới bắt đầu: Khi luyện chuyển hợp âm, hãy bắt đầu RẤT chậm. Tốc độ sẽ đến tự nhiên khi cơ bắp đã có ký ức. Đừng hy sinh độ chính xác vì tốc độ! 🎸",
        likes: 24,
        comments: 8,
        tags: ["tips", "practice", "beginner"],
        title: "Mẹo cho người mới: Chuyển hợp âm!",
        category: "tips"
    },
    {
        id: 3,
        user: { name: "Emma Thompson", avatar: "", level: "Beginner" },
        timestamp: "1 ngày trước", 
        content: "Đầu ngón tay bị đau có bình thường không? Mình mới bắt đầu học một tuần và vẫn còn đau khá nhiều. Có nên nghỉ ngơi không?",
        likes: 7,
        comments: 12,
        tags: ["beginner", "help", "practice"],
        title: "Đầu ngón tay đau - Có bình thường không?",
        category: "beginner"
    },
    {
        id: 4,
        user: { name: "David Park", avatar: "", level: "Expert" },
        timestamp: "2 ngày trước",
        content: "Chia sẻ lịch trình luyện tập giúp mình tiến bộ nhanh:\n\n1. 10 phút khởi động với scales\n2. 20 phút luyện hợp âm\n3. 15 phút luyện bài hát\n4. 5 phút học lý thuyết\n\nTính kiên trì là chìa khóa! 🎯",
        likes: 18,
        comments: 6,
        tags: ["routine", "tips", "practice"],
        title: "Lịch trình luyện tập hằng ngày",
        category: "tips"
    }
];

// Interface cho cấu trúc bài viết
interface ForumPost {
    id: string | number;
    user?: { name: string; avatar?: string; level?: string; };
    author?: { name: string; avatar?: string; level?: string; };
    timestamp?: string;
    created_at?: string;
    content: string;
    likes?: number;
    comments?: number;
    replies?: number;
    tags?: string[];
    title?: string;
    category?: string;
}

const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'general', label: 'Thảo luận chung' },
    { value: 'beginner', label: 'Người mới bắt đầu' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'tips', label: 'Mẹo và thủ thuật' },
    { value: 'gear', label: 'Thiết bị' },
    { value: 'theory', label: 'Lý thuyết âm nhạc' }
];

// ĐỊA CHỈ SERVERLESS FUNCTION CỦA BẠN (Đã sửa)
// Đảm bảo đường dẫn này khớp với nơi bạn deploy health check endpoint
const HEALTH_CHECK_URL = `${window.location.protocol}//${window.location.host}/functions/v1/make-server-8191b256/health`;

export function ForumPage() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("general");
    const [currentCategory, setCurrentCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [serverReady, setServerReady] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Tối đa 3 lần thử (1 lần chính + 2 lần retry)
        checkServerHealth(3).then(() => { 
            loadPosts();
        }).catch(() => {
            // Nếu server không sẵn sàng sau N lần, sử dụng fallback data
            console.warn('Server not ready after multiple retries, using fallback data.');
            setPosts(forumPosts);
            setTotalPages(1);
            setIsLoading(false);
            toast.info('Đang sử dụng dữ liệu mẫu. Server đang khởi động...');
        });
    }, [currentCategory, currentPage]);

    const handleRetry = () => {
        setRetryCount(0);
        setServerReady(false);
        setIsLoading(true);
        checkServerHealth(3).then(() => {
            loadPosts();
        }).catch(() => {
            setPosts(forumPosts);
            setTotalPages(1);
            setIsLoading(false);
            toast.error('Vẫn không thể kết nối server. Hiển thị dữ liệu mẫu.');
        });
    };

    /**
     * @description Kiểm tra sức khỏe của server với logic retry và timeout.
     */
    const checkServerHealth = async (maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Health check attempt ${i + 1}/${maxRetries}`);
                setRetryCount(i); // Cập nhật số lần thử lại (bắt đầu từ 0 cho lần đầu)

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 giây timeout

                const response = await fetch(HEALTH_CHECK_URL, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    console.log('✅ Server is healthy');
                    setServerReady(true);
                    setRetryCount(0);
                    toast.success('Kết nối server thành công!');
                    return;
                }
                
                // Nếu không OK, ném lỗi với status để log
                throw new Error(`HTTP Error ${response.status}`); 

            } catch (error) {
                // Sửa lỗi TypeScript 'unknown' và lỗi timeout/fetch
                const errorMessage = error instanceof Error && error.name === 'AbortError' 
                                     ? 'Connection timeout' 
                                     : (error instanceof Error ? error.message : String(error));
                
                console.error(`❌ Health check attempt ${i + 1} failed:`, errorMessage);
                
                if (i === maxRetries - 1) {
                    // Nếu là lần thử cuối cùng, ném lỗi để useEffect bắt và dùng mock data
                    setServerReady(false);
                    throw new Error(`Failed to connect to server after ${maxRetries} attempts.`);
                }

                // Đợi trước khi retry (1s, 2s, 4s...)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    };

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            console.log('Loading forum posts...', { currentPage, currentCategory });
            // Đảm bảo forumAPI.getPosts có thể xử lý việc chưa có token nếu cần
            const data = await forumAPI.getPosts(currentPage, 10, currentCategory); 
            console.log('Forum posts loaded:', data);
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error loading posts:", error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            toast.error("Không thể tải bài viết: " + errorMessage);
            
            // Fallback to mock data if API fails
            setPosts(forumPosts);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostSubmit = async () => {
        if (!serverReady) {
            toast.error("Server chưa sẵn sàng. Vui lòng thử kết nối lại.");
            return;
        }

        if (!newPostTitle.trim() || !newPostContent.trim()) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
            return;
        }

        setIsPosting(true);
        try {
            const result = await forumAPI.createPost(newPostTitle, newPostContent, selectedCategory);
            toast.success("Đăng bài thành công!");
            setNewPostTitle("");
            setNewPostContent("");
            setSelectedCategory("general");
            setShowCreatePost(false);
            loadPosts(); 
        } catch (error) {
            console.error("Error creating post:", error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            } else {
                toast.error("Không thể đăng bài: " + errorMessage);
            }
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = (postId: string | number) => { 
        setPosts(posts.map(post => 
            post.id === postId 
                ? { ...post, likes: (post.likes || 0) + 1 }
                : post
        ));
    };

    const formatTimestamp = (timestamp: string | undefined) => {
        if (!timestamp) return "không rõ";
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            
            if (diffInMinutes < 1) return "vừa xong";
            if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
            return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
        } catch (e) {
            // Nếu là timestamp kiểu mock-up (ví dụ: "2 hours ago"), trả về ngay
            if (typeof timestamp === 'string' && !isNaN(Date.parse(timestamp)) === false) {
                 return timestamp;
            }
            console.error("Invalid timestamp format:", timestamp);
            return "không rõ thời gian";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">💬</span>
                <h1 className="text-3xl font-bold text-gray-900">Diễn đàn Cộng đồng</h1>
            </div>

            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                    <Button
                        key={category.value}
                        variant={currentCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setCurrentCategory(category.value);
                            setCurrentPage(1);
                        }}
                        className="text-sm"
                    >
                        {category.label}
                    </Button>
                ))}
            </div>

            {/* Server Status & Create Post */}
            <div className="mb-6 space-y-4">
                {/* Server Status */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${serverReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm text-gray-700">
                                {serverReady ? 'Kết nối server thành công' : 'Đang sử dụng dữ liệu mẫu'}
                            </span>
                        </div>
                        {!serverReady && (
                            <div className="flex items-center space-x-2">
                                <Button 
                                    onClick={handleRetry}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    Kết nối lại
                                </Button>
                            </div>
                        )}
                    </div>
                    {!serverReady && (
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Server Edge Function có thể cần 30-60 giây để khởi động lần đầu.
                        </p>
                    )}
                </div>

                {/* Create Post Button */}
                <div>
                    <Button 
                        onClick={() => setShowCreatePost(!showCreatePost)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={!serverReady}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {serverReady ? 'Tạo bài viết mới' : 'Đang kết nối server...'}
                    </Button>
                    {!serverReady && (
                        <p className="text-xs text-gray-500 mt-1">
                            Cần kết nối server để tạo bài viết mới
                        </p>
                    )}
                </div>
            </div>

            {/* Post Creation Form */}
            {showCreatePost && serverReady && (
                <Card className="shadow-lg border-0 mb-6">
                    <CardHeader>
                        <CardTitle>Chia sẻ với cộng đồng</CardTitle>
                        <CardDescription>Đặt câu hỏi, chia sẻ mẹo, hoặc kể về tiến trình của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Tiêu đề bài viết..."
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.slice(1).map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Textarea
                                    placeholder="Nội dung bài viết..."
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="min-h-[150px] resize-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowCreatePost(false)}
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    onClick={handlePostSubmit} 
                                    disabled={isPosting}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isPosting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang đăng...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Đăng bài
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Đang tải diễn đàn...
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {retryCount > 0 && `Đang thử kết nối lại (lần ${retryCount})...`}
                            {!serverReady && retryCount === 0 && "Đang khởi động server..."}
                            {serverReady && "Đang tải bài viết..."}
                        </p>
                        
                        <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                            💡 <strong>Lưu ý:</strong> Lần đầu khởi động có thể mất 30-60 giây
                        </div>
                        
                        {/* Hiển thị nút Sử dụng dữ liệu mẫu nếu đã thử quá nhiều lần */}
                        {retryCount >= 3 && (
                            <div className="mt-4">
                                <Button 
                                    onClick={() => {
                                        setRetryCount(0);
                                        setPosts(forumPosts);
                                        setIsLoading(false);
                                        toast.info('Chuyển sang chế độ offline với dữ liệu mẫu');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Sử dụng dữ liệu mẫu
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h3>
                    <p className="text-gray-500 mb-6">
                        {currentCategory === 'all' 
                            ? 'Hãy là người đầu tiên chia sẻ trong diễn đàn!' 
                            : `Chưa có bài viết nào trong danh mục "${categories.find(c => c.value === currentCategory)?.label}"`
                        }
                    </p>
                    <div className="space-x-2">
                        <Button onClick={handleRetry} variant="outline">
                            Thử lại kết nối
                        </Button>
                        <Button 
                            onClick={() => setShowCreatePost(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={!serverReady}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo bài viết đầu tiên
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Statistics */}
                    <div className={`rounded-lg p-4 mb-6 ${
                        serverReady 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    {serverReady ? 'Diễn đàn trực tuyến' : 'Chế độ demo offline'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {posts.length} bài viết trong {categories.find(c => c.value === currentCategory)?.label.toLowerCase()}
                                </p>
                                {!serverReady && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        📱 Dữ liệu mẫu - Kết nối server để xem bài viết thực
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                {serverReady ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        ✅ Trực tuyến
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        ⚠️ Demo mode
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Forum Feed */}
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <Card key={post.id} className="shadow-lg border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                                {/* Logic lấy tên viết tắt an toàn hơn */}
                                                {post.user?.name ? post.user.name.split(' ').map(n => n[0]).join('') : 
                                                 (post.author?.name ? post.author.name.split(' ').map(n => n[0]).join('') : 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="font-medium text-gray-900">
                                                    {post.user?.name || post.author?.name || 'Người dùng ẩn danh'}
                                                </h3>
                                                <Badge 
                                                    variant="secondary" 
                                                    className="text-xs bg-indigo-100 text-indigo-700"
                                                >
                                                    {post.category || 'general'}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {formatTimestamp(post.created_at || post.timestamp)}
                                                </span>
                                            </div>
                                            
                                            {post.title && (
                                                <h4 className="font-semibold text-lg text-gray-900 mt-2">
                                                    {post.title}
                                                </h4>
                                            )}
                                            
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                                {post.content}
                                            </p>
                                            
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {post.tags.map((tag: string) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <Separator />
                                            
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <button 
                                                    onClick={() => handleLike(post.id)}
                                                    className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                
                                                <button className="flex items-center space-x-2 hover:text-indigo-500 transition-colors">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{post.replies || post.comments || 0}</span>
                                                </button>
                                                
                                                <button className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                                                    <Share className="h-4 w-4" />
                                                    <span>Chia sẻ</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-8">
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Trang trước
                            </Button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Trang sau
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}