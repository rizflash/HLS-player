document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const loadStreamBtn = document.getElementById('load-stream');
  const subtitleInput = document.getElementById('upload-subtitle');
  
  let player = null;

  // Inisialisasi Plyr
  function initPlyr() {
    if(player) player.destroy();
    player = new Plyr(video, {
      captions: { active: true, update: true, language: 'auto' },
      controls: [
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'captions',
        'settings',
        'fullscreen'
      ]
    });
  }

  // Load stream HLS
  loadStreamBtn.addEventListener('click', () => {
    const url = document.getElementById('hls-url').value;
    
    if (!url) {
      alert('Masukkan URL HLS terlebih dahulu!');
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        initPlyr();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      initPlyr();
    }
  });

  // Handle upload subtitle
  subtitleInput.addEventListener('change', (event) => {
    const files = event.target.files;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        let content = e.target.result;
        const ext = file.name.split('.').pop().toLowerCase();
        
        // Konversi SRT ke VTT
        if (ext === 'srt') {
          content = 'WEBVTT\n\n' + content.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
        }
        
        const blob = new Blob([content], { type: 'text/vtt' });
        const track = document.createElement('track');
        
        track.kind = 'subtitles';
        track.label = file.name;
        track.srclang = file.name.split('.')[0];
        track.src = URL.createObjectURL(blob);
        track.default = video.textTracks.length === 0;
        
        video.appendChild(track);
        setTimeout(initCustomCaptions, 500);
      };
      
      reader.readAsText(file);
    });
  });