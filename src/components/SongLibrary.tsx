import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Play, Heart, Clock, Music, Star } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: number;
  chords: string[];
  progression: string[];
  tempo: number;
  key: string;
  lyrics?: string[];
  popularityScore: number;
}

const vietnameseSongs: Song[] = [
  {
    id: 'lk1',
    title: 'Lý Kẻ Đại',
    artist: 'Dân ca Nam Bộ',
    genre: 'Dân ca',
    difficulty: 2,
    chords: ['C', 'Am', 'F', 'G'],
    progression: ['C', 'Am', 'F', 'G', 'C', 'Am', 'G', 'C'],
    tempo: 90,
    key: 'C',
    popularityScore: 95,
    lyrics: [
      'Lý kẻ đại, lý kẻ đại',
      'Kẻ đại nước trong như tuyết',
      'Anh về đừng quên em nhé',
      'Kẻo em buồn lắm anh ơi'
    ]
  },
  {
    id: 'lk2',
    title: 'Lý Cây Bông',
    artist: 'Dân ca Bắc Bộ',
    genre: 'Dân ca',
    difficulty: 1,
    chords: ['Am', 'C', 'F', 'G'],
    progression: ['Am', 'C', 'F', 'G', 'Am', 'F', 'G', 'Am'],
    tempo: 80,
    key: 'Am',
    popularityScore: 90,
    lyrics: [
      'Lý cây bông cây bông nở hoa',
      'Cây bông nở hoa tím ngắt',
      'Chim én bay lượn quanh cành',
      'Hót véo von khắp cả vườn'
    ]
  },
  {
    id: 'pop1',
    title: 'Nơi Tình Yêu Bắt Đầu',
    artist: 'Bằng Kiều',
    genre: 'Nhạc Trẻ',
    difficulty: 3,
    chords: ['C', 'G', 'Am', 'F', 'Dm', 'G7'],
    progression: ['C', 'G', 'Am', 'F', 'Dm', 'G7', 'C', 'G'],
    tempo: 75,
    key: 'C',
    popularityScore: 85,
    lyrics: [
      'Nơi tình yêu bắt đầu',
      'Là nơi em và tôi gặp nhau',
      'Dưới hàng cây xanh mát',
      'Ngày hôm ấy mùa thu sang'
    ]
  },
  {
    id: 'pop2',
    title: 'Diều Gãy',
    artist: 'Vũ.',
    genre: 'Indie',
    difficulty: 4,
    chords: ['Em', 'C', 'G', 'D', 'Am', 'B7'],
    progression: ['Em', 'C', 'G', 'D', 'Em', 'Am', 'B7', 'Em'],
    tempo: 95,
    key: 'Em',
    popularityScore: 92,
    lyrics: [
      'Diều gãy rồi sao còn bay',
      'Lòng này đau từng cơn sóng dài',
      'Giấc mơ xưa giờ đã tan vỡ',
      'Như diều gãy giữa trời cao'
    ]
  },
  {
    id: 'pop3',
    title: 'Anh Sẽ Tốt Mà',
    artist: 'Phạm Hồng Phước',
    genre: 'Ballad',
    difficulty: 3,
    chords: ['G', 'Em', 'C', 'D', 'Am'],
    progression: ['G', 'Em', 'C', 'D', 'G', 'Am', 'C', 'D'],
    tempo: 70,
    key: 'G',
    popularityScore: 88,
    lyrics: [
      'Anh sẽ tốt mà, em đừng lo lắng',
      'Dù cho mai này không còn em bên anh',
      'Anh sẽ học cách để yêu thương',
      'Một mình anh thôi'
    ]
  },
  {
    id: 'rock1',
    title: 'Giấc Mơ Chapi',
    artist: 'Ngũ Cung',
    genre: 'Rock',
    difficulty: 5,
    chords: ['Em', 'C', 'G', 'D', 'Am', 'B7', 'F#'],
    progression: ['Em', 'C', 'G', 'D', 'Em', 'Am', 'B7', 'Em'],
    tempo: 120,
    key: 'Em',
    popularityScore: 78,
    lyrics: [
      'Giấc mơ Chapi bay xa',
      'Vượt qua mọi rào cản',
      'Không gì có thể ngăn cản',
      'Tâm hồn tự do bay cao'
    ]
  },
  {
    id: 'bolero1',
    title: 'Đêm Gành Hào Hoang Vắng',
    artist: 'Hoàng Thi Thơ',
    genre: 'Bolero',
    difficulty: 3,
    chords: ['Am', 'Dm', 'G', 'C', 'F', 'E7'],
    progression: ['Am', 'Dm', 'G', 'C', 'F', 'E7', 'Am', 'Am'],
    tempo: 65,
    key: 'Am',
    popularityScore: 82,
    lyrics: [
      'Đêm Gành Hào hoang vắng',
      'Nghe tiếng sóng vỗ bờ',
      'Lòng ai buồn tênh',
      'Nhớ mong người yêu'
    ]
  },
  {
    id: 'vpop1',
    title: 'Lạc Trôi',
    artist: 'Sơn Tùng M-TP',
    genre: 'V-Pop',
    difficulty: 4,
    chords: ['Bm', 'G', 'D', 'A', 'Em', 'F#'],
    progression: ['Bm', 'G', 'D', 'A', 'Bm', 'Em', 'F#', 'Bm'],
    tempo: 110,
    key: 'Bm',
    popularityScore: 95,
    lyrics: [
      'Baby lạc trôi',
      'Cảm xúc như muôn sao bay',
      'Anh đang lạc trôi',
      'Trong vũ trụ này'
    ]
  }
];

interface SongLibraryProps {
  onSongSelect?: (song: Song) => void;
}

export function SongLibrary({ onSongSelect }: SongLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const genres = ['all', 'Dân ca', 'Nhạc Trẻ', 'Indie', 'Ballad', 'Rock', 'Bolero', 'V-Pop'];
  const difficulties = ['all', '1', '2', '3', '4', '5'];

  const filteredSongs = vietnameseSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || song.genre === selectedGenre;
    const matchesDifficulty = selectedDifficulty === 'all' || song.difficulty.toString() === selectedDifficulty;
    
    return matchesSearch && matchesGenre && matchesDifficulty;
  });

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyText = (level: number) => {
    const levels = ['', 'Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó'];
    return levels[level] || 'Không xác định';
  };

  const getGenreColor = (genre: string) => {
    const colors: { [key: string]: string } = {
      'Dân ca': 'bg-amber-100 text-amber-800',
      'Nhạc Trẻ': 'bg-pink-100 text-pink-800',
      'Indie': 'bg-purple-100 text-purple-800',
      'Ballad': 'bg-blue-100 text-blue-800',
      'Rock': 'bg-gray-100 text-gray-800',
      'Bolero': 'bg-rose-100 text-rose-800',
      'V-Pop': 'bg-indigo-100 text-indigo-800'
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  const topSongs = [...vietnameseSongs].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 6);
  const favoriteSongs = vietnameseSongs.filter(song => favorites.includes(song.id));

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-indigo-600" />
          <span>Thư viện Bài hát Việt Nam</span>
        </CardTitle>
        <CardDescription>
          Học guitar qua các bài hát Việt Nam nổi tiếng với hợp âm chuẩn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bài hát hoặc ca sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Thể loại:</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre === 'all' ? 'Tất cả thể loại' : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Độ khó:</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'Tất cả độ khó' : `Cấp độ ${difficulty}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả bài hát</TabsTrigger>
            <TabsTrigger value="popular">Phổ biến</TabsTrigger>
            <TabsTrigger value="favorites">Yêu thích</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Tìm thấy {filteredSongs.length} bài hát
            </div>
            
            <div className="grid gap-4">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={() => onSongSelect?.(song)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{song.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favorites.includes(song.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Ca sĩ: {song.artist}</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {song.tempo} BPM
                        </span>
                        <span>Key: {song.key}</span>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getGenreColor(song.genre)}>
                          {song.genre}
                        </Badge>
                        <Badge className={getDifficultyColor(song.difficulty)}>
                          {getDifficultyText(song.difficulty)}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          <span className="text-xs">{song.popularityScore}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Hợp âm sử dụng: </span>
                          <span className="text-sm text-gray-600">
                            {song.chords.join(' • ')}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Progression: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {song.progression.map((chord, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {chord}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSongSelect?.(song);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Luyện tập
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="grid gap-4">
              {topSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer relative"
                  onClick={() => onSongSelect?.(song)}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="ml-8">
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.artist}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getGenreColor(song.genre)} variant="secondary">
                        {song.genre}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs">{song.popularityScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favoriteSongs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có bài hát yêu thích nào.</p>
                <p className="text-sm">Nhấp vào ♥ để thêm bài hát vào danh sách yêu thích.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {favoriteSongs.map((song) => (
                  <div
                    key={song.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => onSongSelect?.(song)}
                  >
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.artist}</p>
                    <Badge className={getGenreColor(song.genre)} variant="secondary">
                      {song.genre}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}