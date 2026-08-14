/* ==========================================================================
   GO CAB - CAB BOOKING & DEDICATED DRIVER ENGINE
   ========================================================================== */

(function () {
  'use strict';

  const INITIAL_SEED = {
    users: [
      {
        id: 'vikram',
        name: 'Vikram Passenger',
        role: 'Passenger Account',
        type: 'passenger',
        avatar: 'V',
        email: 'vikram.passenger@gocab.in',
        walletBalance: 450,
        tripsCount: 18,
        rating: 4.9
      },
      {
        id: 'ananya',
        name: 'Ananya Driver Partner',
        role: 'Partner Driver',
        type: 'driver',
        avatar: 'A',
        email: 'ananya.driver@gocab.in',
        car: 'Toyota Prius EV (KA-01-EV-4092)',
        tripsCount: 340,
        rating: 4.95,
        todayEarnings: 184.50,
        todayRides: 8,
        acceptanceRate: '98%',
        isOnline: true
      }
    ],
    tiers: [
      {
        id: 'go',
        title: 'GoCab Hatchback',
        subtitle: 'Affordable hatchback for quick city trips',
        seats: 4,
        eta: '3 mins away',
        basePrice: 12,
        perKm: 2.2,
        icon: 'fa-car-side'
      },
      {
        id: 'comfort',
        title: 'GoCab Comfort Sedan',
        subtitle: 'Top-rated drivers & spacious sedan cars',
        seats: 4,
        eta: '5 mins away',
        basePrice: 18,
        perKm: 3.1,
        icon: 'fa-car'
      },
      {
        id: 'suv',
        title: 'GoCab SUV XL',
        subtitle: '6-seater for group travel & luggage',
        seats: 6,
        eta: '4 mins away',
        basePrice: 28,
        perKm: 4.5,
        icon: 'fa-van-shuttle'
      },
      {
        id: 'executive',
        title: 'GoCab Executive',
        subtitle: 'Premium luxury rides with water & WiFi',
        seats: 4,
        eta: '8 mins away',
        basePrice: 45,
        perKm: 6.8,
        icon: 'fa-car-rear'
      }
    ],
    drivers: [
      { name: 'Rajesh Kumar', rating: '4.9', car: 'Toyota Prius EV', plate: 'KA-01-EV-4092', avatar: 'R', lat: 12.9716, lng: 77.5946 },
      { name: 'Suresh Patel', rating: '4.8', car: 'Hyundai Xcent', plate: 'KA-04-MB-1284', avatar: 'S', lat: 12.9810, lng: 77.6010 },
      { name: 'Priya Sharma', rating: '5.0', car: 'Maruti Ertiga XL', plate: 'KA-05-AB-9012', avatar: 'P', lat: 12.9640, lng: 77.5870 }
    ],
    ridesHistory: [
      {
        id: 'ride-101',
        pickup: 'Central Tech Park, Gate 3',
        drop: 'Airport Terminal 3',
        tier: 'GoCab SUV XL',
        fare: '$42.50',
        date: 'Today, 10:15 AM',
        driver: 'Rajesh Kumar',
        status: 'Completed'
      },
      {
        id: 'ride-102',
        pickup: 'Highland Resort & Spa',
        drop: 'City Railway Station',
        tier: 'GoCab Comfort Sedan',
        fare: '$18.00',
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
    pickup: 'Central Metro Station',
    drop: 'Airport Terminal 3',
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
      <div class="user-badge-minimal" onclick="if(confirm('Log out ${state.user.name}?')){ state.user=null; saveState(); checkAuthView(); }">
        <div class="user-avatar-sm">${state.user.avatar}</div>
        <span style="font-weight: 700; font-size: 13px;">${state.user.name.split(' ')[0]}</span>
        <i class="fa-solid fa-right-from-bracket" style="font-size: 11px; color: var(--text-secondary);"></i>
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
          <h2 style="font-size: 22px; font-weight: 900; font-style: italic; margin-bottom: 4px;">Book a Go Cab</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Set pickup and drop location to get live fare estimates.</p>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-circle-dot" style="color: #10B981;"></i> Pickup Location</label>
            <input type="text" id="pickup-input" class="input-field" value="${state.pickup}">
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-location-dot" style="color: var(--rb-yellow);"></i> Drop-off Destination</label>
            <input type="text" id="drop-input" class="input-field" value="${state.drop}">
          </div>

          <!-- Popular Chips -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Airport Terminal 3')">✈️ Airport T3</span>
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('Central Tech Park')">🏢 Tech Park</span>
            <span class="btn-ghost" style="font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full);" onclick="window.setQuickLocation('City Metro Station')">🚇 Metro</span>
          </div>

          <div style="font-weight: 800; font-size: 12px; letter-spacing: 0.5px; color: var(--rb-yellow); margin-bottom: 8px;">SELECT GO CAB TIER:</div>
          
          <div class="vehicle-tiers-container">
            ${state.tiers.map(t => `
              <div class="vehicle-tier-card ${state.selectedTier === t.id ? 'selected' : ''}" onclick="window.selectCabTier('${t.id}')">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="vehicle-icon-box"><i class="fa-solid ${t.icon}"></i></div>
                  <div>
                    <div style="font-weight: 800; font-size: 14px;">${t.title}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${t.seats} seats • ${t.eta}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 900; font-size: 17px; color: var(--rb-yellow);">$${t.basePrice}</div>
                  <div style="font-size: 10px; color: var(--text-secondary);">est. fare</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 12px; color: var(--text-secondary);">
            <div>Payment: <strong>${state.paymentMethod}</strong></div>
            <button style="background: transparent; border: none; color: var(--rb-yellow); cursor: pointer; font-size: 12px; font-weight: 700;" onclick="window.togglePaymentMethod()">
              Change Payment
            </button>
          </div>

          <button class="btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="window.confirmBooking()">
            <i class="fa-solid fa-car-side"></i> Confirm & Book Go Cab
          </button>
        </div>

        <!-- Live Driver Tracking Map -->
        <div class="map-card">
          <div id="map"></div>
        </div>
      </div>
    `;

    setTimeout(initPassengerMap, 100);
  }

  function renderRidesHistory(container) {
    container.innerHTML = `
      <div class="booking-card">
        <h2 style="font-size: 22px; font-weight: 900; font-style: italic; margin-bottom: 16px;"><i class="fa-solid fa-clock-rotate-left" style="color: var(--rb-yellow);"></i> My Go Cab History (${state.ridesHistory.length})</h2>
        
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${state.ridesHistory.map(r => `
            <div style="padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: #0B132B; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">🚕 ${r.tier} • ${r.fare}</div>
                <div style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-circle-dot" style="color: #10B981;"></i> ${r.pickup}</div>
                <div style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-location-dot" style="color: var(--rb-yellow);"></i> ${r.drop}</div>
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
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div class="user-avatar-sm" style="width: 64px; height: 64px; font-size: 24px;">${u.avatar}</div>
          <div>
            <h2 style="font-size: 22px; font-weight: 900; font-style: italic;">${u.name}</h2>
            <div style="font-size: 13px; color: var(--rb-yellow); font-weight: 700;">${u.role} • ⭐ ${u.rating} Rating</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${u.email}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px;">
          <div style="padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-yellow); background: #0B132B; text-align: center;">
            <div style="font-size: 26px; font-weight: 900; color: var(--rb-yellow);">$${u.walletBalance || 450}.00</div>
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 700; letter-spacing: 0.5px;">GO CAB WALLET BALANCE</div>
            <button class="btn-primary" style="margin-top: 10px; font-size: 12px; padding: 6px 14px;" onclick="alert('Added $50 credits to Go Cab Wallet!')">
              + Top Up Wallet
            </button>
          </div>

          <div style="padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: #0B132B; text-align: center;">
            <div style="font-size: 26px; font-weight: 900; color: #10B981;">${state.ridesHistory.length}</div>
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 700; letter-spacing: 0.5px;">COMPLETED RIDES</div>
          </div>
        </div>
      </div>
    `;
  }

  function initPassengerMap() {
    if (!document.getElementById('map')) return;
    map = L.map('map').setView([12.9716, 77.5946], 13);
    const tileUrl = state.theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl).addTo(map);

    L.marker([12.9716, 77.5946]).addTo(map).bindPopup('📍 Pickup: ' + state.pickup);
    L.marker([12.9810, 77.6100]).addTo(map).bindPopup('🏁 Drop-off: ' + state.drop);

    L.polyline([[12.9716, 77.5946], [12.9810, 77.6100]], { color: '#FFCC00', weight: 5 }).addTo(map);

    INITIAL_SEED.drivers.forEach(d => {
      const cabIcon = L.divIcon({
        className: 'custom-cab-pin',
        html: '<div style="background: var(--rb-yellow); color: #000; padding: 4px 8px; border-radius: 99px; font-weight: 900; font-size: 11px; box-shadow: 0 0 10px rgba(255,204,0,0.5);">🚕 GoCab</div>',
        iconSize: [50, 24]
      });
      L.marker([d.lat, d.lng], { icon: cabIcon }).addTo(map).bindPopup(`<strong>${d.name}</strong><br>${d.car}`);
    });
  }

  function initDriverPageMap() {
    setTimeout(() => {
      if (!document.getElementById('map')) return;
      map = L.map('map').setView([12.9750, 77.5990], 13);
      const tileUrl = state.theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      L.tileLayer(tileUrl).addTo(map);

      const driverCabIcon = L.divIcon({
        className: 'custom-cab-pin',
        html: '<div style="background: var(--rb-red); color: #FFF; padding: 4px 10px; border-radius: 99px; font-weight: 900; font-size: 11px; box-shadow: 0 0 12px rgba(230,0,0,0.6);">🚖 You (GoCab Driver)</div>',
        iconSize: [110, 24]
      });
      L.marker([12.9750, 77.5990], { icon: driverCabIcon }).addTo(map).bindPopup('<strong>Ananya Driver Partner</strong><br>Toyota Prius EV');
    }, 100);
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
    if (txt) txt.textContent = state.driverOnline ? 'ONLINE (Receiving Go Cab Rides)' : 'OFFLINE (On Break)';
    if (btn) {
      btn.textContent = state.driverOnline ? 'Go Offline' : 'Go Online 🟢';
      btn.className = state.driverOnline ? 'btn-ghost' : 'btn-primary';
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
      alert('✅ Go Cab OTP Verified! Navigation started to Airport Terminal 3. Total fare $36.50 added to your daily earnings!');
      
      const earnElem = document.getElementById('driver-today-earnings');
      if (earnElem) earnElem.textContent = '$221.00';
    } else {
      alert('Invalid Go Cab OTP. Please enter 7492');
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
      fare: `$${activeTier.basePrice}.00`,
      date: 'Just now',
      driver: assignedDriver.name,
      status: 'Completed'
    });

    saveState();
  };

  function bindLoginPageEvents() {
    const rolePassBtn = document.getElementById('role-passenger-btn');
    const emailInput = document.getElementById('login-email');
    const labelEmail = document.getElementById('login-label-email');
    const submitBtn = document.getElementById('login-submit-btn');

    if (rolePassBtn) {
      rolePassBtn.addEventListener('click', () => {
        state.loginRole = 'passenger';
        if (emailInput) emailInput.value = 'vikram.passenger@gocab.in';
        if (labelEmail) labelEmail.textContent = 'Passenger Phone / Email';
        if (submitBtn) submitBtn.textContent = '⚡ Sign In to Go Cab';
      });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.user = INITIAL_SEED.users[0];
        saveState();
        checkAuthView();
      });
    }

    document.querySelectorAll('.demo-login-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const demoKey = e.currentTarget.dataset.demo;
        const found = INITIAL_SEED.users.find(u => u.id === demoKey);
        if (found) {
          state.user = found;
          saveState();
          checkAuthView();
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
