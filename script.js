// spinner.js
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  // --- Configuration ---
  const API_URL = 'json/song_list.php';  // IMPORTANT: This is your data source
  const SPIN_DURATION_SECONDS = 6;       // How long the spin animation lasts

  // --- DOM Elements ---
  const spinButton = document.getElementById('spin-button');
  const reel = document.getElementById('spinner-reel');
  const winnerDisplay = document.getElementById('winner-display');
  const winnerLink = document.getElementById('winner-link');
  const winnerDurationEl = document.getElementById('winner-duration');
  const winnerTitleEl = document.getElementById('winner-title');
  const winnerNameEl = document.getElementById('winner-name');

  // --- State ---
  let isSpinning = false;
  let songs = [];  // Keep track of the current list of songs

  // --- Get constants from CSS ---
  const itemHeight = parseInt(getComputedStyle(document.documentElement)
                                  .getPropertyValue('--item-height'));

  // --- Functions ---
  const createSpinnerItem = (item) => {
    const div = document.createElement('div');
    div.classList.add('spinner-item');

    const title = document.createElement('div');
    title.classList.add('song-title');
    title.textContent = item.song.title;

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = `by ${item.donator.name}`;

    div.appendChild(title);
    div.appendChild(name);

    return div;
  };

  /**
   * Fetches the latest song list, populates the reel, and updates the state.
   * @returns {Promise<Array|null>} A shuffled list of songs, or null on
   *     failure.
   */
  async function setupSpinner() {
    // let songList;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const isCustomServer = response.headers.get('Custom-Server') || false;
      if (!isCustomServer) {
        console.warn('This is not a custom server response.');
        let notLiveBanner = document.querySelector('.test-environment-banner');

        // If it doesn't exist, create it
        if (!notLiveBanner) {
          const notLiveBanner = document.createElement('div');
          notLiveBanner.textContent =
              'DEMO ENVIRONMENT - NOT PULLING LIVE SONG DATA';
          notLiveBanner.classList.add('test-environment-banner');
          document.body.appendChild(notLiveBanner);
        }
      }
      const data = await response.json();
      songs = data.data.filter(item => item.played === '0');

      if (songs.length === 0) {
        showToast('No songs available.', '#ff0000');
        reel.innerHTML =
            '<div class="spinner-item"><div class="song-title">No unplayed songs!</div></div>';
        spinButton.disabled = true;
        throw new Error('No songs to spin.');
      }
    } catch (error) {
      console.error('Failed to fetch or process song list:', error);
      return null;  // Signal failure
    }

    // --- Prepare the Reel ---
    reel.innerHTML = '';

    // We still create the duplicated list for the "infinite loop" visual effect
    const reelItems = [...songs, ...songs, ...songs];
    reelItems.forEach(item => reel.appendChild(createSpinnerItem(item)));

    return songs;  // Return the core list
  }

  /**
   * Displays the winner's information and then prepares for the next round.
   */
  const displayWinner = (winner) => {
    winnerTitleEl.textContent = winner.song.title;
    winnerLink.href = winner.song.link;
    winnerLink.textContent = winner.song.link.replace('https://', '');
    winnerLink.target = '_blank';
    winnerTitleEl.href = winner.song.link;
    winnerTitleEl.target = '_blank';
    winnerNameEl.textContent = `Suggested by: ${winner.donator.name}`;
    const {hours, minutes, seconds} = parseDuration(winner.song.duration);
    winnerDurationEl.textContent = `${hours ? hours + ':' : ''}${minutes}:${
        seconds < 10 ? '0' : ''}${seconds}`;
    winnerDisplay.classList.remove('hidden');

    isSpinning = false;
    spinButton.disabled = false;  // Now the button is ready again

    // After showing the winner, get the new list ready in the background.
    setTimeout(() => {
      startIdleAnimation();
    }, 5000);
  };

  /**
   * This is the core animation function. It only spins the items currently
   * visible.
   */
  const runSpinner = async () => {
    if (isSpinning) return;
    if (songs.length === 0) {
      alert('No songs to spin. The list might be empty.');
      return;
    }
    await setupSpinner();

    isSpinning = true;
    spinButton.disabled = true;
    winnerDisplay.classList.add('hidden');

    // --- Capture the current position to prevent the jump ---
    const computedStyle = window.getComputedStyle(reel);
    const currentTransform = computedStyle.transform;
    const startY = new DOMMatrix(currentTransform).m42;

    // Stop the idle animation and FREEZE the reel at its current position
    reel.style.animation = 'none';
    reel.style.transition = 'none';
    reel.style.transform = `translateY(${startY}px)`;
    reel.offsetHeight;  // Force browser to apply the change immediately

    // --- Determine the Winner from the CURRENT list ---
    const winnerIndex = Math.floor(Math.random() * songs.length);
    const winner = songs[winnerIndex];

    // --- Animate the Spin with requestAnimationFrame ---
    const duration = SPIN_DURATION_SECONDS * 1000;
    const startTime = performance.now();
    // Adjust the easing function based on the number of songs
    const slowDownFactor =
        Math.min(songs.length / 20, 0.8);  // Adjust divisor to taste
    const ease = cubicBezier(0.2, 0.8 + slowDownFactor / 4, 0.2, 1);
    const loopHeight = songs.length * itemHeight;

    // The final "resting" position for the winner in the pointer (slot 4, index
    // 3) We target the winner in the *second* copy of the list for a seamless
    // wrap.
    const targetY = -((winnerIndex + songs.length - 3) * itemHeight);
    const numberOfLoops =
        Math.max(200, 2 * songs.length);  // 200 songs to loop over
    console.log(numberOfLoops)
    const finalDestinationY = targetY - (numberOfLoops * itemHeight);
    const totalDistance = startY - finalDestinationY;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);

      const distanceTraveled = totalDistance * easedProgress;
      const currentAbsoluteY = startY - distanceTraveled;

      const translateY = -(((-currentAbsoluteY) % loopHeight));
      reel.style.transform = `translateY(${translateY}px)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        reel.style.transition = 'none';
        // reel.style.transform = `translateY(${targetY}px)`;
        reel.offsetHeight;
        displayWinner(winner);
      }
    }

    requestAnimationFrame(animate);
  };

  /**
   * A JavaScript implementation of CSS cubic-bezier easing.
   */
  function cubicBezier(mX1, mY1, mX2, mY2) {
    const A = (aA1, aA2) => 1.0 - 3.0 * aA2 + 3.0 * aA1;
    const B = (aA1, aA2) => 3.0 * aA2 - 6.0 * aA1;
    const C = (aA1) => 3.0 * aA1;
    const CalcBezier = (aT, aA1, aA2) =>
        ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    const GetSlope = (aT, aA1, aA2) =>
        3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    function GetTforX(aX) {
      let aGuessT = aX;
      for (let i = 0; i < 4; ++i) {
        let currentSlope = GetSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        let currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }
    return (aX) =>
               (aX === 0 || aX === 1) ? aX : CalcBezier(GetTforX(aX), mY1, mY2);
  }

  function parseDuration(isoDuration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return {hours: 0, minutes: 0, seconds: 0};
    const hours = parseInt(matches[1]) || 0;
    const minutes = parseInt(matches[2]) || 0;
    const seconds = parseInt(matches[3]) || 0;
    return {hours, minutes, seconds};
  }

  /**
   * Starts the idle scrolling animation on the reel.
   */
  function startIdleAnimation() {
    if (isSpinning) return;  // Don't start idle animation while spinning
    if (songs.length > 0) {
      // Capture the current position to prevent the jump
      const startY = new DOMMatrix(window.getComputedStyle(reel).transform).m42;

      // Calculate translateY for seamless looping
      reel.style.animation = 'none';
      const loopHeight = songs.length * itemHeight;
      let startTime = performance.now();

      function animateIdle(currentTime) {
        if (isSpinning) {
          return;
        }

        const distance =
            loopHeight * ((currentTime - startTime) / (songs.length * 1200));
        const translateY = ((startY - distance) % loopHeight);
        reel.style.transform = `translateY(${translateY}px)`;

        requestAnimationFrame(animateIdle);
      }

      requestAnimationFrame(animateIdle);
    }
  }

  /**
   * Fetches the latest list, rebuilds the reel, and readies the spinner for the
   * next go.
   */
  async function setup() {
    await setupSpinner();  // Get new list and rebuild the reel DOM
    startIdleAnimation();  // Start the new idle animation
    isSpinning = false;
    spinButton.disabled = false;  // Now the button is ready again
  }

  // --- Initial Setup ---
  spinButton.addEventListener('click', runSpinner);

  // Display the background color value for debugging/info
  const bgColor =
      getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
  const colorElement = document.getElementById('color');
  colorElement.textContent = bgColor;
  colorElement.addEventListener('mouseover', () => {
    colorElement.textContent = 'Click to copy: ' + bgColor;
  });
  colorElement.addEventListener('mouseout', () => {
    colorElement.textContent = bgColor;
  });
  colorElement.addEventListener('click', (event) => {
    const colorValue = event.target.textContent;
    navigator.clipboard.writeText(bgColor)
        .then(() => {
          showToast(`Color copied: ${bgColor}`);
        })
        .catch(err => {
          console.error('Failed to copy color: ', err);
        });
  });

  // --- Toast ---
  function showToast(message, color, duration = 3000) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    // Add toast styles to CSS
    const style = document.createElement('style');
    style.backgroundColor = color || '#333';
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 100);

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);  // Wait for the fade-out transition
    }, duration);
  }

  // Initial page load:
  setup();
});