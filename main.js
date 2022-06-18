// 1. Render songs
// 2. Scroll top
// 3. Play/pause/seek
// 4. CD rotate
// 5. Next/prev
// 6. Random
// 7. Next/repeat when end
// 8. ACtive song
// 9. Scroll active song into view
// 10. Play song when click


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'CNG_PLAYER'

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playButton = $('.btn-toggle-play');
const player = $('.player')
const progress = $('#progress');
const nextButton = $('.btn-next');
const prevButton = $('.btn-prev');
const randomButton = $('.btn-random');
const repeatButton = $('.btn-repeat');
const playList = $('.playlist');



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs:
    [
        {
            name: 'Save Your Tears',
            singer: 'The Weeknd',
            path: './musics/song1.mp3',
            image: './images/song3.jpg'
        },
        {
            name: 'Light Switch',
            singer: 'Charlie Puth',
            path: './musics/song2.mp3',
            image: './images/song3.jpg'
        },
        {
            name: 'I Like You',
            singer: 'Post Malone',
            path: './musics/song3.mp3',
            image: './images/song3.jpg'
        },    
        {
            name: 'Wrecked',
            singer: 'Imagine Dragon',
            path: './musics/song4.mp3',
            image: './images/song4.jpg'
        },
        {
            name: 'Red Right Hand',
            singer: 'Nick Cave And The Bad Seeds',
            path: './musics/song5.mp3',
            image: './images/thomas.jpg'
        },
        {
            name: 'Goodbyes',
            singer: 'Post Malone',
            path: './musics/song6.mp3',
            image: './images/song3.jpg'
        },
        {
            name: 'Wont Go Home Without you',
            singer: 'Maroon 5',
            path: './musics/song7.mp3',
            image: './images/song6.jpg'
        },
        {
            name: 'Its Time',
            singer: 'Imagine Dragon',
            path: './musics/song8.mp3',
            image: './images/imagedragon.jpg'
        }     
    ],

    render: function() {
        const htmls = this.songs.map((song,index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                        <div class="thumb" style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`       
        })

        playList.innerHTML = htmls.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const _this = this //lưu this bên ngoài handleEvents
        const cdWidth = cd.offsetWidth //lấy ra kích thước của cd

        // Xử lý CD rotate
        const cdThumbAnimated = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity         
        });
        cdThumbAnimated.pause()
     
        // Xử lý phóng to / thu nhỏ
        document.onscroll = function () {   //Lấy ra sự kiện scroll
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop // chiều rộng của cd trừ đi độ dài scroll

            cd.style.width =  newCdWidth > 0 ? newCdWidth + 'px' : 0 //Nếu newCdWidth > 0 thì set newCdWidth ko thì set = 0
            cd.style.opacity = newCdWidth/cdWidth //độ mờ bằng kích thước mới chia cho kích thước cũ
        }

        // Xử lý play audio
        playButton.onclick = function () { 
            //Click vào button play nếu isPlaying là đúng thì dừng + remove(playing), ngược lại thì phát + add(playing)
            if(_this.isPlaying) {           
                audio.pause();                               
            } else {
                audio.play();                
            }
        }    

        //Khi nhạc được phát
        audio.onplay = function () {                    
            _this.isPlaying = true             
            player.classList.add('playing');
            cdThumbAnimated.play();
        }           

        //Khi nhạc được dừng
        audio.onpause = function () {                    
            _this.isPlaying = false             
            player.classList.remove('playing');
            cdThumbAnimated.pause()
        } 

        //Tiến độ bài hát
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        //Xử lý tua nhạc
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value //tổng thời gian chia thời gian hiện tại
            audio.currentTime =  seekTime;
        }

        //Bài tiếp theo
        nextButton.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong();
        }

        //Bài trước
        prevButton.onclick = function () {
            if (_this.randomSong) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }     
            
        //Random songs
        randomButton.onclick = function (e) {
            _this.isRandom = !_this.isRandom 
            _this.setConfig('isRandom', _this.isRandom)
            randomButton.classList.toggle('active', _this.isRandom)                        
        }

        //Xử lý repeat
        repeatButton.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatButton.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý khi kết thúc bài hát
        audio.onended = function () {
            if (_this.isRepeat) {                    
                audio.play() 
            } else {
                nextButton.click();
            }
            // if (_this.randomSong) {
            //     _this.randomSong();
            // } else {
            //     _this.nextSong()                  
            // }
            //     audio.play()                
        }

        //Click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index) //songNode.dataset.index trả về kiểu chuỗi phải convert sang number
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play()
                }

                if (e.target.closest('.option')) {
                    console.log(123)
                }
            }
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function () {
        this.currentIndex++
        if(this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();      
    },

    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length) //chỉ từ 0 đến độ dài của list
        } while (newIndex === this.currentIndex)
        
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300);
    },


    
    start: function() {
        // Gán cấu hình config vào ứng dụng
        this.loadConfig()

        // Định nghĩa thuộc tính cho object
        this.defineProperties()

        // Render bài hát
        this.render()

        // Tải bài hát đầu tiên vào UI khi chạy
        this.loadCurrentSong()

        // Lắng nghe & xử lý sự kiện
        this.handleEvents()

        // Hiển thị trạng thái ban đầu 
        randomButton.classList.toggle('active', this.isRandom)
        repeatButton.classList.toggle('active', this.isRepeat)
    },

  
}

app.start()
