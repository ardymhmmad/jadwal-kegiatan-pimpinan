<template>
  <div class="display-root" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- Background -->
    <div class="display-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow-left"></div>
      <div class="bg-glow-right"></div>
    </div>

    <!-- Main layout -->
    <div class="display-wrapper">

      <!-- ═══════════════════════════════════════
           HEADER
      ═══════════════════════════════════════ -->
      <header class="display-header">
        <!-- Left: Logo + Instansi -->
        <div class="header-left">
          <div class="logo-box">
            <img v-if="instansiStore.data?.logo_url"
              :src="instansiStore.data.logo_url"
              class="w-full h-full object-contain p-1" alt="Logo" />
            <svg v-else class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
            </svg>
          </div>
          <div class="instansi-info">
            <p class="instansi-sub">{{ instansiStore.data?.nama_pemda || 'PEMERINTAH PROVINSI / KABUPATEN / KOTA' }}</p>
            <h1 class="instansi-name">{{ instansiStore.data?.nama || 'NAMA INSTANSI' }}</h1>
            <p class="instansi-unit">{{ instansiStore.data?.unit || 'Unit / Bidang / Dinas' }}</p>
          </div>
        </div>

        <!-- Center: Title -->
        <div class="header-center">
          <div class="title-badge">JADWAL KEGIATAN</div>
          <h2 class="header-title">Kepala Badan Pengelolaan Keuangan dan Aset Daerah</h2>
          <p class="header-subtitle">{{ todayFullLabel }}</p>
        </div>

        <!-- Right: Clock -->
        <div class="header-right">
          <div class="clock-display">
            <span class="clock-time">{{ currentTime }}</span>
            <span class="clock-date">{{ currentDateShort }}</span>
          </div>
          <!-- Refresh indicator -->
          <div class="refresh-indicator" :class="{ 'refreshing': isRefreshing }">
            <svg class="refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Auto refresh</span>
          </div>
        </div>
      </header>

      <!-- Divider -->
      <div class="header-divider">
        <div class="divider-line"></div>
        <div class="divider-diamond"></div>
        <div class="divider-line"></div>
      </div>

      <!-- ═══════════════════════════════════════
           CONTENT AREA
      ═══════════════════════════════════════ -->
      <main class="display-content">

        <!-- Loading state - hanya saat pertama kali dan data masih kosong -->
        <div v-if="agendaStore.loading && agendaStore.agendaList.length === 0" class="state-center">
          <div class="loading-spinner"></div>
          <p class="state-text">Memuat jadwal...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="agendaStore.displayAgenda.length === 0" class="state-center">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
          </div>
          <p class="state-text">Tidak ada jadwal kegiatan</p>
          <p class="state-sub">Jadwal akan muncul secara otomatis</p>
        </div>

        <!-- Agenda Table -->
        <div v-else class="agenda-table-wrap">
          <table class="agenda-table">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th class="col-tanggal">Hari, Tanggal</th>
                <th class="col-waktu">Waktu</th>
                <th class="col-kegiatan">Kegiatan</th>
                <th class="col-tempat">Tempat</th>
                <th class="col-keterangan">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in agendaStore.displayAgenda" :key="item.id"
                class="agenda-row"
                :class="{
                  'row-priority': item.prioritas,
                  'row-today': !item.prioritas && isToday(item.tanggal),
                  'row-future': !item.prioritas && !isToday(item.tanggal)
                }">
                <td class="col-no">
                  <span class="row-number">{{ index + 1 }}</span>
                </td>
                <td class="col-tanggal">
                  <div class="tanggal-wrap">
                    <div class="flex items-center gap-2">
                      <span class="tanggal-hari">{{ formatHari(item.tanggal) }}</span>
                      <span v-if="isToday(item.tanggal)"
                        class="inline-block px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded font-semibold border border-emerald-500/30">
                        Hari Ini
                      </span>
                    </div>
                    <span class="tanggal-tgl">{{ formatTanggalDisplay(item.tanggal) }}</span>
                  </div>
                </td>
                <td class="col-waktu">
                  <div class="waktu-box">
                    <span v-if="item.waktu" class="waktu-text">{{ item.waktu.slice(0,5) }}</span>
                    <span v-else class="tentatif-text">Tentatif</span>
                    <span v-if="item.prioritas" class="priority-star">★</span>
                  </div>
                </td>
                <td class="col-kegiatan">
                  <div class="kegiatan-wrap">
                    <span v-if="item.prioritas" class="priority-badge">PRIORITAS</span>
                    <p class="kegiatan-text">{{ item.kegiatan }}</p>
                  </div>
                </td>
                <td class="col-tempat">
                  <div class="tempat-wrap">
                    <svg class="loc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    {{ item.tempat }}
                  </div>
                </td>
                <td class="col-keterangan">{{ item.keterangan || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <!-- ═══════════════════════════════════════
           FOOTER
      ═══════════════════════════════════════ -->
      <footer class="display-footer">
        <div class="footer-left">
          <span class="footer-dot" :class="realtimeConnected ? 'dot-green' : 'dot-yellow'"></span>
          {{ realtimeConnected ? 'Terhubung realtime' : 'Menghubungkan...' }}
        </div>
        <div class="footer-center">
          Sistem Informasi Jadwal Kegiatan Pimpinan
        </div>
        <div class="footer-right">
          Terakhir diperbarui: {{ lastUpdated }}
        </div>
      </footer>
    </div>

    <!-- ═══════════════════════════════════════
         RUNNING TEXT TICKER (fixed bottom)
    ═══════════════════════════════════════ -->
    <div v-if="rtStore.aktifList.length > 0" class="ticker-bar">
      <div class="ticker-label">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
        </svg>
        INFO
      </div>
      <div class="ticker-track">
        <div class="ticker-content" :style="{ animationDuration: tickerDuration }">
          {{ rtStore.tickerText }}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;{{ rtStore.tickerText }}
        </div>
      </div>
    </div>

    <!-- Fullscreen toggle -->
    <button @click="toggleFullscreen" class="fullscreen-btn" title="Toggle fullscreen">
      <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAgendaStore }      from '@/stores/agenda'
import { useInstansiStore }    from '@/stores/instansi'
import { useRunningTextStore } from '@/stores/runningText'
import { supabase }            from '@/lib/supabase'

const agendaStore   = useAgendaStore()
const instansiStore = useInstansiStore()
const rtStore       = useRunningTextStore()

const currentTime      = ref('')
const currentDateShort = ref('')
const lastUpdated      = ref('')
const isRefreshing     = ref(false)
const isFullscreen     = ref(false)
const realtimeConnected = ref(false)

let clockInterval   = null
let refreshInterval = null
let reconnectInterval = null
let realtimeChannel = null

// Durasi animasi ticker — semakin panjang teks semakin lambat
const tickerDuration = computed(() => {
  const len = rtStore.tickerText.length
  const secs = Math.max(20, Math.min(60, len * 0.18))
  return `${secs}s`
})

// Tinggi baris otomatis mengisi layar berdasarkan jumlah data
const rowHeight = computed(() => {
  const count = agendaStore.displayAgenda.length || 1
  return `calc((100% ) / ${count})`
})

// ─── Helpers ────────────────────────────────────────────
function nowWITA() {
  const now = new Date()
  return new Date(now.getTime() + (8 * 60 * 60 * 1000))
}
function todayWITA() {
  return nowWITA().toISOString().split('T')[0]
}
function isToday(d) {
  return d === todayWITA()
}

// ─── Formatters ─────────────────────────────────────────
function formatHari(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
}
function formatTanggalDisplay(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ─── Clock (WITA) ────────────────────────────────────────
function updateClock() {
  const wita = nowWITA()
  const hh = String(wita.getUTCHours()).padStart(2, '0')
  const mm = String(wita.getUTCMinutes()).padStart(2, '0')
  const ss = String(wita.getUTCSeconds()).padStart(2, '0')
  currentTime.value = `${hh}.${mm}.${ss}`

  currentDateShort.value = wita.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'short', day: 'numeric', month: 'short'
  })
  lastUpdated.value = `${hh}:${mm}:${ss}`
}

const todayFullLabel = computed(() =>
  nowWITA().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)

// ─── Data fetch ─────────────────────────────────────────
async function refreshData() {
  isRefreshing.value = true
  try {
    await Promise.all([
      agendaStore.fetchFromToday(),
      instansiStore.fetch(),
      rtStore.fetchAll(),
    ])
  } catch (e) {
    console.warn('Refresh gagal:', e.message)
  } finally {
    isRefreshing.value = false
  }
}

// ─── Realtime ───────────────────────────────────────────
function setupRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
  realtimeChannel = supabase
    .channel('display-all-' + Date.now())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' },       () => agendaStore.fetchFromToday())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, () => rtStore.fetchAll())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'instansi' },     () => instansiStore.fetch())
    .subscribe((status) => {
      realtimeConnected.value = status === 'SUBSCRIBED'
      // Jika gagal subscribe, coba reconnect setelah 5 detik
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setTimeout(setupRealtime, 5000)
      }
    })
}

// ─── Fullscreen ─────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  // Auto refresh setiap 30 detik sebagai backup
  refreshInterval = setInterval(refreshData, 30000)
  // Reconnect realtime setiap 10 menit untuk jaga koneksi tetap segar
  reconnectInterval = setInterval(setupRealtime, 600000)
  refreshData()
  setupRealtime()
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  // Refresh saat tab kembali aktif (misal layar monitor nyala lagi)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshData()
      setupRealtime()
    }
  })
})

onUnmounted(() => {
  clearInterval(clockInterval)
  clearInterval(refreshInterval)
  clearInterval(reconnectInterval)
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────── */
.display-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: stretch;
  background: #050d1a;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
}

/* ── Background ──────────────────────────────────────── */
.display-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}
.bg-glow-left {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 50%;
  height: 70%;
  background: radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 70%);
}
.bg-glow-right {
  position: absolute;
  bottom: -20%;
  right: -10%;
  width: 50%;
  height: 70%;
  background: radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%);
}

/* ── Wrapper ─────────────────────────────────────────── */
.display-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem 2.5rem 4rem;
  gap: 0;
}

/* ── Header ──────────────────────────────────────────── */
.display-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.25rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo-box {
  width: 4rem;
  height: 4rem;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, #1e40af, #2563eb);
  border: 1px solid rgba(96,165,250,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(37,99,235,0.4);
}
.logo-icon {
  width: 2rem;
  height: 2rem;
  color: #93c5fd;
}
.instansi-sub {
  font-size: 0.6rem;
  color: #64748b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1;
}
.instansi-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #e2e8f0;
  line-height: 1.2;
  margin-top: 0.2rem;
  letter-spacing: 0.02em;
}
.instansi-unit {
  font-size: 0.7rem;
  color: #475569;
  margin-top: 0.15rem;
}

.header-center {
  text-align: center;
}
.title-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #60a5fa;
  background: rgba(37,99,235,0.15);
  border: 1px solid rgba(96,165,250,0.2);
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}
.header-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.08em;
  line-height: 1;
  text-shadow: 0 0 30px rgba(96,165,250,0.5);
}
.header-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}
.clock-display {
  text-align: right;
}
.clock-time {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.2rem;
  font-weight: 600;
  color: #60a5fa;
  letter-spacing: 0.04em;
  line-height: 1;
  text-shadow: 0 0 20px rgba(96,165,250,0.4);
}
.clock-date {
  display: block;
  font-size: 0.75rem;
  color: #475569;
  margin-top: 0.2rem;
  text-align: right;
}
.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  color: #334155;
}
.refresh-icon {
  width: 0.85rem;
  height: 0.85rem;
  color: #334155;
}
.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
  color: #60a5fa;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ─────────────────────────────────────────── */
.header-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent);
}
.divider-diamond {
  width: 6px;
  height: 6px;
  background: #2563eb;
  transform: rotate(45deg);
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(37,99,235,0.8);
}

/* ── Content ─────────────────────────────────────────── */
.display-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  flex: 1;
}
.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(37,99,235,0.2);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.empty-icon {
  width: 5rem;
  height: 5rem;
  color: #1e3a5f;
}
.empty-icon svg { width: 100%; height: 100%; }
.state-text { font-size: 1.1rem; color: #475569; font-weight: 500; }
.state-sub  { font-size: 0.8rem; color: #334155; }

/* ── Table ───────────────────────────────────────────── */
.agenda-table-wrap {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(37,99,235,0.2);
  background: rgba(10,20,40,0.6);
  backdrop-filter: blur(8px);
  flex: 1;
  display: flex;
  flex-direction: column;
}
.agenda-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  height: 100%;
}
.agenda-table tbody {
  height: 100%;
}
.agenda-table tbody tr {
  height: v-bind(rowHeight);
}
.agenda-table thead tr {
  background: linear-gradient(90deg, rgba(30,64,175,0.8), rgba(37,99,235,0.6));
}
.agenda-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #93c5fd;
  border-bottom: 1px solid rgba(37,99,235,0.3);
}
.col-no        { width: 3.5rem;  text-align: center; }
.col-tanggal   { width: 11rem; }
.col-waktu     { width: 7rem; }
.col-kegiatan  { min-width: 18rem; }
.col-tempat    { width: 13rem; }
.col-keterangan { width: auto; }

/* Rows */
.agenda-row {
  border-bottom: 1px solid rgba(37,99,235,0.08);
  transition: background 0.2s;
}
.agenda-row:last-child { border-bottom: none; }
.agenda-row:hover { background: rgba(37,99,235,0.08); }

.row-priority {
  background: rgba(217,119,6,0.06);
}
.row-priority:hover { background: rgba(217,119,6,0.1); }
.row-today {
  background: rgba(5,150,105,0.05);
}
.row-today:hover { background: rgba(5,150,105,0.09); }
.row-future {
  background: rgba(15,23,42,0.3);
}
.row-future:hover { background: rgba(37,99,235,0.06); }

.agenda-table td {
  padding: 0.5rem 1.25rem;
  vertical-align: middle;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.row-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(37,99,235,0.15);
  border: 1px solid rgba(37,99,235,0.25);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 700;
  color: #60a5fa;
  margin: 0 auto;
}

.tanggal-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.tanggal-hari {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}
.tanggal-tgl {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
}

.waktu-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.waktu-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: #38bdf8;
  letter-spacing: 0.05em;
}
.tentatif-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(100,116,139,0.15);
  border: 1px solid rgba(100,116,139,0.25);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.priority-star {
  color: #f59e0b;
  font-size: 0.8rem;
}

.kegiatan-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.priority-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #f59e0b;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.kegiatan-text {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.35;
}
.row-priority .kegiatan-text {
  color: #fde68a;
}

.tempat-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.875rem;
}
.loc-icon {
  width: 0.9rem;
  height: 0.9rem;
  color: #475569;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* ── Footer ──────────────────────────────────────────── */
.display-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  margin-top: 1.25rem;
  border-top: 1px solid rgba(37,99,235,0.12);
  font-size: 0.68rem;
  color: #334155;
}
.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.footer-center {
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #1e3a5f;
}
.footer-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.dot-green  { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-yellow { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

/* ── Fullscreen button ───────────────────────────────── */
.fullscreen-btn {
  position: fixed;
  bottom: 3rem;
  right: 1.25rem;
  z-index: 50;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgba(15,30,60,0.7);
  border: 1px solid rgba(37,99,235,0.2);
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.fullscreen-btn:hover {
  color: #60a5fa;
  border-color: rgba(96,165,250,0.4);
  background: rgba(37,99,235,0.15);
}

/* ── Ticker bar ──────────────────────────────────────── */
.ticker-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  height: 2.25rem;
  background: linear-gradient(90deg, #1e3a8a, #1d4ed8, #1e3a8a);
  border-top: 1px solid rgba(96,165,250,0.25);
  overflow: hidden;
}
.ticker-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.875rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #93c5fd;
  background: rgba(15,30,80,0.6);
  height: 100%;
  white-space: nowrap;
  border-right: 1px solid rgba(96,165,250,0.2);
  flex-shrink: 0;
}
.ticker-track {
  flex: 1;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
}
.ticker-content {
  display: inline-block;
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 500;
  color: #bfdbfe;
  letter-spacing: 0.02em;
  animation: ticker-scroll linear infinite;
  padding-left: 100%;
}
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
