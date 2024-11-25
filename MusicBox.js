class MusicBox {
    constructor({ onComplete }) {
        this.songs = [
            './music/chill-beat.mp3',
            './music/kyho.mp3',
            './music/rock-yo-world.mp3'
        ];
        this.songImages = [
            './music/cover/album1.jpg',
            './music/cover/album2.jpg',
            './music/cover/album3.jpg'
        ];

        if (!MusicBox.audio) {
            MusicBox.audio = new Audio();
        }

        // Retrieve saved song index, playback state, and position from localStorage
        this.currentSongIndex = localStorage.getItem('currentSongIndex') 
            ? parseInt(localStorage.getItem('currentSongIndex'), 10) 
            : 0;

        this.isPlaying = localStorage.getItem('isPlaying') === 'true' ? true : false;
        const savedTime = localStorage.getItem('currentTime');
        this.currentTime = savedTime ? parseFloat(savedTime) : 0;

        // Only update the src if the song is different
        if (MusicBox.audio.src !== this.songs[this.currentSongIndex]) {
            MusicBox.audio.src = this.songs[this.currentSongIndex];
        }

        MusicBox.audio.currentTime = this.currentTime;  // Restore the playback position
        MusicBox.audio.autoplay = this.isPlaying;

        this.onComplete = onComplete;
        this.createElement();
    }

    createElement() {
        const musicBoxContainer = document.createElement('div');
        musicBoxContainer.classList.add('music-box-container');

        this.playButton = document.createElement('button');
        this.playButton.classList.add(this.isPlaying ? 'pause-button' : 'play-button');
        this.playButton.addEventListener('click', () => this.toggleMusic());

        const prevButton = document.createElement('button');
        prevButton.classList.add('prev-button');
        prevButton.addEventListener('click', () => this.changeSong(-1));

        const nextButton = document.createElement('button');
        nextButton.classList.add('next-button');
        nextButton.addEventListener('click', () => this.changeSong(1));

        const exitButton = document.createElement('button');
        exitButton.classList.add('exitButton');
        exitButton.textContent = 'Exit';
        exitButton.addEventListener('click', () => this.exitButton());

        this.image = document.createElement('img');
        this.image.src = this.songImages[this.currentSongIndex];
        this.image.classList.add('music-box-image');

        musicBoxContainer.appendChild(prevButton);
        musicBoxContainer.appendChild(this.image);
        musicBoxContainer.appendChild(this.playButton);
        musicBoxContainer.appendChild(nextButton);

        this.element = document.createElement("div");
        this.element.classList.add("musicBox");
        this.element.appendChild(musicBoxContainer);
        this.element.appendChild(exitButton);

        this.element.style.opacity = '0';
        this.element.style.transition = 'opacity 1s ease';
    }

    toggleMusic() {
        if (MusicBox.audio.paused) {
            MusicBox.audio.play();
            this.playButton.classList.remove('play-button');
            this.playButton.classList.add('pause-button');
            this.isPlaying = true;
        } else {
            MusicBox.audio.pause();
            this.playButton.classList.remove('pause-button');
            this.playButton.classList.add('play-button');
            this.isPlaying = false;
        }
        localStorage.setItem('isPlaying', this.isPlaying);
    }

    changeSong(direction) {
        this.currentSongIndex = (this.currentSongIndex + direction + this.songs.length) % this.songs.length;

        // Only update the src and currentTime if the song changes
        MusicBox.audio.src = this.songs[this.currentSongIndex];
        this.image.src = this.songImages[this.currentSongIndex];
        MusicBox.audio.play();
        this.playButton.classList.remove('play-button');
        this.playButton.classList.add('pause-button');
        localStorage.setItem('currentSongIndex', this.currentSongIndex);

        // Reset the currentTime for the new song and play it if necessary
        MusicBox.audio.currentTime = 0;
    }

    exitButton() {
        // Save the current state: song index, playing status, and current time
        localStorage.setItem('currentSongIndex', this.currentSongIndex);
        localStorage.setItem('isPlaying', this.isPlaying);
        localStorage.setItem('currentTime', MusicBox.audio.currentTime);  // Save the current playback position

        // Optionally stop the song when exiting (or leave it to continue in the background)
        MusicBox.audio.pause();

        // Fade out the music box container and remove it
        this.element.style.opacity = '0';
        this.element.style.transition = 'opacity 1s ease';

        this.element.addEventListener('transitionend', () => {
            if (this.element.style.opacity === '0') {
                this.element.remove();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        });
    }

    init(container) {
        container.appendChild(this.element);
        setTimeout(() => {
            this.element.style.opacity = '1';
        }, 50);
    }
}
