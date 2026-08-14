/* ==========================================================================
   GO CAB — PASSENGER & GO CAB WHEEL MAN ENGINE
   ========================================================================== */

(function () {
  'use strict';

  const KOCHI_COORDS = {
    'Marine Drive, High Court Junction, Kochi': [9.9796, 76.2763],
    'Central Metro Station': [9.9796, 76.2763],
    'Cochin International Airport (CIAL T3)': [10.1520, 76.3922],
    'Airport Terminal 3': [10.1520, 76.3922],
    'Infopark Kakkanad': [10.0088, 76.3620],
    'Lulu Mall Edappally': [10.0270, 76.3080],
    'Vytilla Mobility Hub': [9.9675, 76.3180],
    'Ernakulam South Railway Station': [9.9672, 76.2882],
    'Fort Kochi Beach Promenade': [9.9658, 76.2421]
  };

  const INITIAL_SEED = {
    users: [
      {
        id: 'vikram',
        name: 'Vikram Passenger',
        role: 'Passenger Account',
        type: 'passenger',
        avatar: 'V',
        email: 'vikram.passenger@gocab.in',
        walletBalance: 1500,
        tripsCount: 18,
        rating: 4.9
      },
      {
        id: 'ananya',
        name: 'Ananya Wheel Man',
        role: 'Go Cab Wheel Man',
        type: 'driver',
        avatar: 'A',
        email: 'ananya.driver@gocab.in',
        car: 'Toyota Prius EV (KL-07-EV-4092)',
        tripsCount: 340,
        rating: 4.95,
        todayEarnings: 2480.00,
        weeklyEarnings: 14500.00,
        todayRides: 8,
        acceptanceRate: '98%',
        isOnline: true
      }
    ],
    tiers: [
      {
        id: 'go',
        title: 'GoCab Hatchback',
        subtitle: 'Affordable hatchback for quick city trips in Kochi',
        seats: 4,
        eta: '3 mins away',
        basePrice: 140,
        perKm: 14,
        icon: 'fa-car-side'
      },
      {
        id: 'comfort',
        title: 'GoCab Comfort Sedan',
        subtitle: 'Top-rated drivers & AC sedan cars',
        seats: 4,
        eta: '5 mins away',
        basePrice: 220,
        perKm: 18,
        icon: 'fa-car'
      },
      {
        id: 'suv',
        title: 'GoCab SUV XL',
        subtitle: '6-seater for airport luggage & group travel',
        seats: 6,
        eta: '4 mins away',
        basePrice: 380,
        perKm: 26,
        icon: 'fa-van-shuttle'
      },
      {
        id: 'executive',
        title: 'GoCab Executive',
        subtitle: 'Premium luxury rides with water & WiFi',
        seats: 4,
        eta: '8 mins away',
        basePrice: 650,
        perKm: 42,
        icon: 'fa-car-rear'
      }
    ],
    drivers: [
      { name: 'Rajesh Kumar', rating: '4.9', car: 'Toyota Prius EV', plate: 'KL-07-EV-4092', avatar: 'R', lat: 9.9796, lng: 76.2763 },
      { name: 'Suresh Patel', rating: '4.8', car: 'Hyundai Xcent', plate: 'KL-07-MB-1284', avatar: 'S', lat: 10.0088, lng: 76.3620 },
      { name: 'Priya Sharma', rating: '5.0', car: 'Maruti Ertiga XL', plate: 'KL-39-AB-9012', avatar: 'P', lat: 10.0270, lng: 76.3080 }
    ],
    ridesHistory: [
      {
        id: 'ride-101',
        pickup: 'Infopark Kakkanad',
        drop: 'Cochin International Airport (CIAL T3)',
        tier: 'GoCab SUV XL',
        fare: '₹580.00',
        date: 'Today, 10:15 AM',
        driver: 'Rajesh Kumar',
        status: 'Completed'
      },
      {
        id: 'ride-102',
        pickup: 'Fort Kochi Beach Promenade',
        drop: 'Ernakulam South Railway Station',
        tier: 'GoCab Comfort Sedan',
        fare: '₹240.00',
        date: 'Yesterday, 6:30 PM',
        driver: 'Priya Sharma',
        status: 'Completed'
      }
    ]
  };

  let state = {
    user: null,
    tiers: INITIAL_SEED.tiers,
    selectedTier: 'comfort',
    pickup: 'Marine Drive, High Court Junction, Kochi',
    drop: 'Cochin International Airport (CIAL T3)',
    ridesHistory: [],
    activeTab: 'book',
    loginRole: 'passenger',
    paymentMethod: 'Cash',
    driverOnline: true,
    theme: 'dark'
  };

  let map = null;

  function init() {
    loadState();
    initTheme();

    const isDriverPage = document.body.dataset.appMode === 'driver';
    if (isDriverPage) {
      state.user = INITIAL_SEED.users[1];
      initDriverPageMap();
    } else {
      checkAuthView();
      bindLoginPageEvents();
    }

    bindEvents();
  }

  function loadState() {
    const storedUser = localStorage.getItem('gocab_user');
    const storedHistory = localStorage.getItem('gocab_history');
    const storedTheme = localStorage.getItem('gocab_theme');

    state.user = storedUser ? JSON.parse(storedUser) : null;
    state.ridesHistory = storedHistory ? JSON.parse(storedHistory) : INITIAL_SEED.ridesHistory;
    state.theme = storedTheme || 'dark';
  }

  function saveState() {
    if (state.user) {
      localStorage.setItem('gocab_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('gocab_user');
    }
    localStorage.setItem('gocab_history', JSON.stringify(state.ridesHistory));
    localStorage.setItem('gocab_theme', state.theme);
  }

  window.logout = function() {
    state.user = null;
    saveState();
    const isDriverPage = document.body.dataset.appMode === 'driver';
    if (isDriverPage) {
      window.location.href = 'index.html';
    } else {
      checkAuthView();
    }
  };

  function checkAuthView() {
    const loginView = document.getElementById('login-page-view');
    const appView = document.getElementById('main-app-view');

    if (!loginView || !appView) return;

    if (!state.user) {
      loginView.style.display = 'flex';
      appView.style.display = 'none';
    } else {
      loginView.style.display = 'none';
      appView.style.display = 'block';
      renderAuthArea();
      renderActiveTab();
    }
  }

  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = state.theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function renderAuthArea() {
    const authArea = document.getElementById('auth-area');
    if (!authArea || !state.user) return;

    authArea.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="user-badge-minimal" title="${state.user.name}">
          <div class="user-avatar-sm">${state.user.avatar}</div>
          <span style="font-weight: 600; font-size: 13px;">${state.user.name.split(' ')[0]}</span>
        </div>
        <button class="btn-ghost" onclick="window.logout()" style="padding: 6px 12px; font-size: 12px;" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i> Log Out
        </button>
      </div>
    `;
  }

  function renderActiveTab() {
    const container = document.getElementById('tab-content-area');
    if (!container) return;

    if (state.activeTab === 'book') {
      renderBookingView(container);
    } else if (state.activeTab === 'rides') {
      renderRidesHistory(container);
    } else if (state.activeTab === 'profile') {
      renderAccountView(container);
    }
  }

  function renderBookingView(container) {
    container.innerHTML = `
      <div class="booking-layout">
        <!-- Booking Panel -->
        <div class="booking-card">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">Book a Cab in Kochi</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Set pickup and drop location to update map route live.</p>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-circle-dot" style="color: var(--brand-emerald);"></i> Pickup Location</label>
            <input type="text" id="pickup-input" class="input-field" value="${state.pickup}">
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-location-dot"></i> Drop-off Destination</label>
            <input type="text" id="drop-input" class="input-field" value="${state.drop}">
          </div>

          <!-- Popular Kochi Chips -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Cochin International Airport (CIAL T3)')">✈️ CIAL Airport T3</span>
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Infopark Kakkanad')">🏢 Infopark Kakkanad</span>
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Lulu Mall Edappally')">🛍️ Lulu Mall</span>
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Vytilla Mobility Hub')">🚇 Vytilla Hub</span>
          </div>

          <div style="font-weight: 700; font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">SELECT VEHICLE:</div>
          
          <div class="vehicle-tiers-container">
            ${state.tiers.map(t => `
              <div class="vehicle-tier-card ${state.selectedTier === t.id ? 'selected' : ''}" onclick="window.selectCabTier('${t.id}')">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="vehicle-icon-box"><i class="fa-solid ${t.icon}"></i></div>
                  <div>
                    <div style="font-weight: 700; font-size: 13.5px;">${t.title}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${t.seats} seats • ${t.eta}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 16px;">₹${t.basePrice}</div>
                  <div style="font-size: 10px; color: var(--text-secondary);">est. fare</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 12px; color: var(--text-secondary);">
            <div>Payment: <strong>${state.paymentMethod}</strong></div>
            <button style="background: transparent; border: none; color: var(--text-primary); cursor: pointer; font-size: 12px; font-weight: 600;" onclick="window.togglePaymentMethod()">
              Change Payment
            </button>
          </div>

          <button class="btn-primary" style="width: 100%; justify-content: center; padding: 12px;" onclick="window.confirmBooking()">
            <i class="fa-solid fa-car-side"></i> Confirm & Book Go Cab
          </button>
        </div>

        <!-- Live Driver Tracking Map -->
        <div class="map-card">
          <div id="map"></div>
        </div>
      </div>
    `;

    bindLocationInputEvents();
    setTimeout(initPassengerMap, 100);
  }

  function bindLocationInputEvents() {
    const pickupIn = document.getElementById('pickup-input');
    const dropIn = document.getElementById('drop-input');

    if (pickupIn) {
      pickupIn.addEventListener('input', (e) => {
        state.pickup = e.target.value;
        initPassengerMap();
      });
    }

    if (dropIn) {
      dropIn.addEventListener('input', (e) => {
        state.drop = e.target.value;
        initPassengerMap();
      });
    }
  }

  function renderRidesHistory(container) {
    container.innerHTML = `
      <div class="booking-card">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 16px;"><i class="fa-solid fa-clock-rotate-left"></i> My Ride History (${state.ridesHistory.length})</h2>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${state.ridesHistory.map(r => `
            <div style="padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-card); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; font-size: 14.5px; margin-bottom: 4px;">🚕 ${r.tier} • ${r.fare}</div>
                <div style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-circle-dot" style="color: var(--brand-emerald);"></i> ${r.pickup}</div>
                <div style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-location-dot"></i> ${r.drop}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">Driver: ${r.driver} • ${r.date}</div>
              </div>
              <button class="btn-ghost" style="font-size: 12px; padding: 6px 12px;" onclick="alert('Digital Go Cab Receipt Downloaded!')">
                <i class="fa-solid fa-file-invoice"></i> Receipt
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderAccountView(container) {
    const u = state.user || INITIAL_SEED.users[0];

    container.innerHTML = `
      <div class="booking-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="user-avatar-sm" style="width: 56px; height: 56px; font-size: 20px;">${u.avatar}</div>
            <div>
              <h2 style="font-size: 20px; font-weight: 800;">${u.name}</h2>
              <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">${u.role} • ⭐ ${u.rating} Rating</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${u.email}</div>
            </div>
          </div>
          <button class="btn-ghost" onclick="window.logout()" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
            <i class="fa-solid fa-right-from-bracket"></i> Sign Out
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px;">
          <div style="padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-app); text-align: center;">
            <div style="font-size: 24px; font-weight: 800;">₹${u.walletBalance || 1500}.00</div>
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">GO CAB WALLET</div>
            <button class="btn-primary" style="margin-top: 10px; font-size: 12px; padding: 6px 14px;" onclick="alert('Added ₹500 credits to Go Cab Wallet!')">
              + Top Up Wallet
            </button>
          </div>

          <div style="padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-app); text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: var(--brand-emerald);">${state.ridesHistory.length}</div>
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">COMPLETED RIDES</div>
          </div>
        </div>
      </div>
    `;
  }

  function getCoordsForLocation(locationName, fallbackCoords) {
    if (!locationName) return fallbackCoords;
    for (let key in KOCHI_COORDS) {
      if (locationName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(locationName.toLowerCase())) {
        return KOCHI_COORDS[key];
      }
    }
    return fallbackCoords;
  }

  function initPassengerMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') return;

    if (map) {
      map.remove();
      map = null;
    }

    try {
      const pickupCoords = getCoordsForLocation(state.pickup, [9.9796, 76.2763]);
      const dropCoords = getCoordsForLocation(state.drop, [10.1520, 76.3922]);

      map = L.map('map').setView(pickupCoords, 11);
      
      const tileUrl = state.theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);

      // Pickup Marker
      L.marker(pickupCoords).addTo(map).bindPopup('📍 Pickup: ' + state.pickup);
      
      // Drop-off Marker
      L.marker(dropCoords).addTo(map).bindPopup('🏁 Drop-off: ' + state.drop);

      // Dynamically fit map bounds around pickup and drop pins
      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      map.fitBounds(bounds, { padding: [40, 40] });

      // Draw polyline route connecting pickup to drop-off
      L.polyline([pickupCoords, dropCoords], { color: '#10B981', weight: 4, dashArray: '6, 6' }).addTo(map);

      // Nearby Drivers
      INITIAL_SEED.drivers.forEach(d => {
        const cabIcon = L.divIcon({
          className: 'custom-cab-pin',
          html: '<div style="background: #18181B; color: #FFF; border: 1px solid #3F3F46; padding: 4px 8px; border-radius: 99px; font-weight: 700; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🚕 GoCab</div>',
          iconSize: [50, 24]
        });
        L.marker([d.lat, d.lng], { icon: cabIcon }).addTo(map).bindPopup(`<strong>${d.name}</strong><br>${d.car}`);
      });

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);

    } catch (err) {
      console.error('Passenger Map Initialization Error:', err);
    }
  }

  function initDriverPageMap() {
    setTimeout(() => {
      const mapElement = document.getElementById('map');
      if (!mapElement || typeof L === 'undefined') return;

      if (map) {
        map.remove();
        map = null;
      }

      try {
        map = L.map('map').setView([10.0088, 76.3620], 12);
        const tileUrl = state.theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        const driverCabIcon = L.divIcon({
          className: 'custom-cab-pin',
          html: '<div style="background: #10B981; color: #FFF; padding: 4px 10px; border-radius: 99px; font-weight: 700; font-size: 11px; box-shadow: 0 2px 8px rgba(16,185,129,0.4);">🚖 Wheel Man (Infopark, Kochi)</div>',
          iconSize: [160, 24]
        });
        L.marker([10.0088, 76.3620], { icon: driverCabIcon }).addTo(map).bindPopup('<strong>Ananya Wheel Man Partner</strong><br>Toyota Prius EV • Infopark Kakkanad');

        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 250);

      } catch (err) {
        console.error('Driver Map Initialization Error:', err);
      }
    }, 150);
  }

  window.selectCabTier = function(tierId) {
    state.selectedTier = tierId;
    renderActiveTab();
  };

  window.setQuickLocation = function(dropLoc) {
    state.drop = dropLoc;
    renderActiveTab();
  };

  window.togglePaymentMethod = function() {
    const methods = ['Cash', 'Credit Card', 'Go Cab Wallet', 'UPI'];
    const idx = (methods.indexOf(state.paymentMethod) + 1) % methods.length;
    state.paymentMethod = methods[idx];
    renderActiveTab();
  };

  window.toggleDriverOnlineStatus = function() {
    state.driverOnline = !state.driverOnline;
    const dot = document.getElementById('driver-status-dot');
    const txt = document.getElementById('driver-status-text');
    const btn = document.getElementById('driver-toggle-online-btn');

    if (dot) dot.style.backgroundColor = state.driverOnline ? '#10B981' : '#EF4444';
    if (txt) txt.textContent = state.driverOnline ? 'Online (Receiving Wheel Man Rides)' : 'Offline (On Break)';
    if (btn) {
      btn.textContent = state.driverOnline ? 'Go Offline' : 'Go Online 🟢';
      btn.className = 'btn-ghost';
    }
  };

  window.driverAcceptRide = function() {
    document.getElementById('driver-request-modal').classList.remove('active');
    document.getElementById('otp-verify-modal').classList.add('active');
  };

  window.verifyOtpAndStartTrip = function() {
    const otpVal = document.getElementById('otp-input').value;
    if (otpVal === '7492') {
      document.getElementById('otp-verify-modal').classList.remove('active');

      const fareAmount = 580;

      // 1. Update Today's Earnings
      const todayElem = document.getElementById('driver-today-earnings');
      if (todayElem) {
        let currentToday = parseFloat(todayElem.textContent.replace(/[^0-9.]/g, '')) || 2480;
        let newToday = currentToday + fareAmount;
        todayElem.textContent = '₹' + newToday.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      }

      // 2. Update Weekly Earnings
      const weeklyElem = document.getElementById('driver-weekly-earnings');
      if (weeklyElem) {
        let currentWeekly = parseFloat(weeklyElem.textContent.replace(/[^0-9.]/g, '')) || 14500;
        let newWeekly = currentWeekly + fareAmount;
        weeklyElem.textContent = '₹' + newWeekly.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      }

      // 3. Update Completed Rides Count
      const ridesElem = document.getElementById('driver-completed-rides');
      if (ridesElem) {
        let currentRides = parseInt(ridesElem.textContent) || 8;
        ridesElem.textContent = (currentRides + 1) + ' Rides';
      }

      // Update state user object if logged in
      if (state.user) {
        state.user.todayEarnings = (state.user.todayEarnings || 2480) + fareAmount;
        state.user.todayRides = (state.user.todayRides || 8) + 1;
        saveState();
      }

      alert('✅ Go Cab OTP Verified! Ride accepted & started to Cochin International Airport (CIAL T3). Total fare ₹580.00 added to your daily earnings!');
    } else {
      alert('Invalid OTP. Please enter 7492');
    }
  };

  window.confirmBooking = function() {
    const activeTier = state.tiers.find(t => t.id === state.selectedTier);
    const assignedDriver = INITIAL_SEED.drivers[0];
    const otp = 7492;

    document.getElementById('driver-otp-display').textContent = `OTP: ${otp}`;
    document.getElementById('driver-name').textContent = `${assignedDriver.name} ⭐ ${assignedDriver.rating}`;
    document.getElementById('driver-car').textContent = `${assignedDriver.car} • ${assignedDriver.plate}`;
    document.getElementById('driver-modal').classList.add('active');

    state.ridesHistory.unshift({
      id: 'ride-' + Date.now(),
      pickup: state.pickup,
      drop: state.drop,
      tier: activeTier.title,
      fare: `₹${activeTier.basePrice}.00`,
      date: 'Just now',
      driver: assignedDriver.name,
      status: 'Completed'
    });

    saveState();
  };

  function bindLoginPageEvents() {
    const rolePassBtn = document.getElementById('role-passenger-btn');
    const roleDriverBtn = document.getElementById('role-driver-btn');
    const emailInput = document.getElementById('login-email');
    const labelEmail = document.getElementById('login-label-email');
    const submitBtn = document.getElementById('login-submit-btn');

    if (rolePassBtn && roleDriverBtn) {
      rolePassBtn.addEventListener('click', () => {
        rolePassBtn.classList.add('active');
        roleDriverBtn.classList.remove('active');
        state.loginRole = 'passenger';
        if (emailInput) emailInput.value = 'vikram.passenger@gocab.in';
        if (labelEmail) labelEmail.textContent = 'Passenger Phone / Email';
        if (submitBtn) submitBtn.textContent = 'Sign In as Passenger';
      });

      roleDriverBtn.addEventListener('click', () => {
        roleDriverBtn.classList.add('active');
        rolePassBtn.classList.remove('active');
        state.loginRole = 'driver';
        if (emailInput) emailInput.value = 'ananya.driver@gocab.in';
        if (labelEmail) labelEmail.textContent = 'Wheel Man License / Email';
        if (submitBtn) submitBtn.textContent = 'Sign In to Go Cab Wheel Man ➔';
      });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.loginRole === 'driver') {
          window.location.href = 'driver.html';
        } else {
          state.user = INITIAL_SEED.users[0];
          saveState();
          checkAuthView();
        }
      });
    }

    document.querySelectorAll('.demo-login-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const demoKey = e.currentTarget.dataset.demo;
        if (demoKey === 'ananya') {
          window.location.href = 'driver.html';
        } else {
          const found = INITIAL_SEED.users.find(u => u.id === demoKey);
          if (found) {
            state.user = found;
            saveState();
            checkAuthView();
          }
        }
      });
    });
  }

  function bindEvents() {
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.activeTab = e.currentTarget.dataset.tab;
        renderActiveTab();
      });
    });

    window.switchTab = function(tabKey) {
      state.activeTab = tabKey;
      document.querySelectorAll('.nav-link').forEach(b => {
        if (b.dataset.tab === tabKey) b.classList.add('active');
        else b.classList.remove('active');
      });
      renderActiveTab();
    };

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        initTheme();
        saveState();
        if (document.body.dataset.appMode !== 'driver') renderActiveTab();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
