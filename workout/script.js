'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;
class workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  setdescribe() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.describe = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  clicki() {
    this.clicks++;
  }
}
class running extends workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcpace();
    this.setdescribe();
  }
  calcpace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class cycling extends workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calspeed();
    this.setdescribe();
  }
  calspeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class app {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this.getposition();
    this.toggle();
    this.getlocalsto();
    form.addEventListener('submit', this.workout.bind(this));
    containerWorkouts.addEventListener('click', this.movepopup.bind(this));
  }
  getposition() {
    navigator.geolocation?.getCurrentPosition(
      this.loadmap.bind(this),
      function () {
        alert('unable get locations');
      }
    );
  }
  loadmap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 17);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this.showmap.bind(this));
    this.#workouts.forEach(work => {
      this.rendermarker(work);
    });
  }

  showmap(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  toggle() {
    inputType.addEventListener('change', function () {
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });
  }
  workout(e) {
    e.preventDefault();
    const validinputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const allpositive = (...inputs) => inputs.every(input => input > 0);
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout1;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validinputs(distance, duration, cadence) ||
        !allpositive(distance, duration, cadence)
      ) {
        return alert('distance should be a positive number');
      }
      workout1 = new running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validinputs(distance, duration, elevation) ||
        !allpositive(distance, duration)
      ) {
        return alert('distance should be a positive number');
      }
      workout1 = new cycling([lat, lng], distance, duration, elevation);
    }
    this.#workouts.push(workout1);

    this.rendermarker(workout1);
    this.renderworkout(workout1);
    this.hideform();
    this.localsto();
  }
  hideform() {
    //prettier-ignore
    inputDistance.value =inputDuration.value =inputCadence.value =inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => ((form.style.display = 'grid'), 1000));
  }
  rendermarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .openPopup()
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.describe}`
      );
  }
  renderworkout(workout1) {
    let html = ` <li class="workout ${workout1.type}" data-id="${workout1.id}">
          <h2 class="workout__title">${workout1.describe}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout1.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout1.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout1.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    if (workout1.type === 'running') {
      html += `<div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout1.pace.toFixed(
                          1
                        )}</span>
                        <span class="workout__unit">min/km</span>
                      </div>
                    <div class="workout__details">
                         <span class="workout__icon">🦶🏼</span>
                         <span class="workout__value">${workout1.cadence.toFixed(
                           1
                         )}</span>
                         <span class="workout__unit">spm</span>
                </div>
              </li>`;
    }

    if (workout1.type === 'cycling') {
      html += `<div class="workout__details">
                            <span class="workout__icon">⚡️</span>
                            <span class="workout__value">${workout1.speed.toFixed(
                              1
                            )}</span>
                            <span class="workout__unit">min/km</span>
                          </div>
                        <div class="workout__details">
                             <span class="workout__icon">🦶🏼</span>
                             <span class="workout__value">${
                               workout1.elevation
                             }</span>
                             <span class="workout__unit">spm</span>
                    </div>
                  </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  movepopup(e) {
    const workout = e.target.closest('.workout');

    if (!workout) return;

    const find = this.#workouts.find(work => work.id === workout.dataset.id);

    this.#map.setView(find.coords, 13, {
      Animation: true,
      pan: { duration: 1 },
    });
    find.clicki();
  }
  localsto() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  getlocalsto() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this.renderworkout(work);
    });
  }
}
const APP = new app();
