import Interval from './Interval';

export default class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number = 0;
  slide: Element;
  interval: Interval | null;
  pausedTimeout: ReturnType<typeof setTimeout> | null;
  paused: boolean;
  thumbItems: HTMLElement[] | null;
  thumb: HTMLElement | null;
  constructor(
    container: Element,
    slides: Element[],
    controls: Element,
    time: number = 5000
  ) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.interval = null;
    this.pausedTimeout = null;
    this.index = Number(localStorage.getItem('slide-index')) || 0;
    this.slide = this.slides[this.index];
    this.paused = false;

    this.thumbItems = null;
    this.thumb = null;

    this.init();
  }
  hide(slide: Element) {
    slide.classList.remove('active');
    if (slide instanceof HTMLVideoElement) {
      slide.pause();
      slide.currentTime = 0;
    }
  }
  show(index: number) {
    this.index = index;
    this.slide = this.slides[this.index];
    localStorage.setItem('slide-index', String(this.index));

    if (this.thumbItems) {
      this.thumb = this.thumbItems[this.index];
      this.thumb.classList.add('active');
      this.thumbItems.forEach((item, i) => {
        if (i !== this.index) {
          item.classList.remove('active');
        }
      });
    }

    this.slides.forEach((slide) => this.hide(slide));
    this.slide.classList.add('active');
    if (this.slide instanceof HTMLVideoElement) {
      this.autoVideo(this.slide);
    } else {
      this.auto(this.time);
    }
  }
  autoVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.play();
    let fistPlay = true;
    video.addEventListener('playing', () => {
      if (fistPlay) {
        fistPlay = false;
        this.auto(video.duration * 1000);
      }
    });
  }
  auto(time: number) {
    this.interval?.clear();
    this.interval = new Interval(() => this.next(), time);
    if (this.thumb) {
      this.thumb.style.animationDuration = `${time}ms`;
    }
  }
  prev() {
    if (this.paused) return;
    this.show((this.index - 1 + this.slides.length) % this.slides.length);
  }
  next() {
    if (this.paused) return;
    this.show((this.index + 1) % this.slides.length);
  }
  pause() {
    document.body.classList.add('paused');
    if (this.pausedTimeout !== null) {
      clearTimeout(this.pausedTimeout);
    }
    this.pausedTimeout = setTimeout(() => {
      this.paused = true;
      if (this.thumb) {
        this.thumb.style.animationPlayState = 'paused';
      }
      this.interval?.pause();
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.pause();
      }
    }, 200);
  }
  continue() {
    document.body.classList.remove('paused');
    if (this.pausedTimeout !== null) {
      clearTimeout(this.pausedTimeout);
      this.pausedTimeout = null;
    }
    if (this.paused) {
      this.interval?.continue();
      if (this.thumb) {
        this.thumb.style.animationPlayState = 'running';
      }
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.play();
      }
    }
    this.paused = false;
  }
  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);
    prevButton.innerText = 'Prev';
    nextButton.innerText = 'Next';

    this.controls.addEventListener('pointerdown', () => this.pause());
    document.addEventListener('pointerup', () => this.continue());
    document.addEventListener('touchend', () => this.continue());

    nextButton.addEventListener('pointerup', () => this.next());
    prevButton.addEventListener('pointerup', () => this.prev());
  }
  private addThumbItems() {
    const thumbContainer = document.createElement('div');
    thumbContainer.classList.add('slide-thumb');
    for (let i = 0; i < this.slides.length; i++) {
      thumbContainer.innerHTML += `<span><span class='thumb-item'></span></span>`
    }
    this.controls.appendChild(thumbContainer);
    this.thumbItems = Array.from(thumbContainer.querySelectorAll('.thumb-item'));
  }
  private init() {
    this.addControls();
    this.addThumbItems();
    this.show(this.index);
  }
}
