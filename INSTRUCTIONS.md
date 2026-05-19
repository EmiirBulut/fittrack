# FitTrack — Build Instructions
# For use with Claude Code
# Place at the root of the repository.
# Bu dosyayı her oturumda baştan oku. Kod yazmadan önce ilgili Phase ve Step'i tam olarak oku.

---

## Genel Prensipler

- Her Phase'i sırayla tamamla. Bir sonraki Phase'e geçmeden önce mevcut Phase'deki tüm step'ler çalışıyor olmalı.
- Her step sonunda TypeScript hataları sıfır olmalı (`tsc --noEmit` geçmeli).
- Supabase migration'ları `supabase/migrations/` altında tarih-prefixli SQL dosyası olarak yaz.
- Tasarım için CLAUDE.md Section 10'daki Ant Design tema tokenlarını kullan. Tailwind kullanma.
- Tüm metinler Türkçe olacak (UI label, hata mesajları, placeholder).

---

## Supabase Tablo Yapısı (Referans)

```sql
-- Her tablo user_id içerir; RLS aktif

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  youtube_url text,
  image_url text,
  created_at timestamptz default now()
);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

create table workout_steps (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts on delete cascade not null,
  exercise_id uuid references exercises on delete set null,
  step_type text check (step_type in ('exercise','rest')) not null,
  order_index integer not null,
  duration_seconds integer,
  reps integer,
  tracking_type text check (tracking_type in ('duration','reps')) not null default 'duration'
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  workout_id uuid references workouts on delete set null,
  completed_at timestamptz default now(),
  duration_seconds integer not null
);
```

---

## Phase 0 — Proje Kurulumu

### Step 0.1 — Vite + React + TypeScript

```bash
npm create vite@latest fittrack -- --template react-ts
cd fittrack
npm install
```

### Step 0.2 — Bağımlılıkları Kur

```bash
npm install \
  @supabase/supabase-js \
  @tanstack/react-query \
  zustand \
  react-router-dom \
  react-hook-form \
  @hookform/resolvers \
  zod \
  antd \
  @ant-design/icons
```

### Step 0.3 — Klasör Yapısını Oluştur

CLAUDE.md Section 2'deki yapıyı `src/` altında oluştur. Her klasöre `.gitkeep` koy.

### Step 0.4 — Supabase Client

`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

`.env.local`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 0.5 — Ant Design ConfigProvider + Tema

`src/lib/antdTheme.ts` dosyasını CLAUDE.md Section 10'daki token'larla oluştur.

`src/main.tsx`'i güncelle:
```tsx
import { ConfigProvider } from 'antd';
import { antdTheme } from './lib/antdTheme';

// QueryClient + RouterProvider + ConfigProvider sarmalayıcıları
```

### Step 0.6 — Google Fonts

`index.html` head'e ekle:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Step 0.7 — Global CSS

`src/assets/styles/globals.css`:
```css
.display-font {
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
}
```

### Step 0.8 — Route Sabitleri

`src/router/routes.ts`:
```ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  EXERCISES: '/exercises',
  WORKOUTS: '/workouts',
  WORKOUT_NEW: '/workouts/new',
  WORKOUT_EDIT: (id: string) => `/workouts/${id}/edit`,
  WORKOUT_START: (id: string) => `/workouts/${id}/start`,
} as const;
```

### Step 0.9 — Query Key Sabitleri

`src/lib/queryKeys.ts`:
```ts
export const QUERY_KEYS = {
  EXERCISES: ['exercises'] as const,
  EXERCISE_DETAIL: (id: string) => ['exercises', id] as const,
  WORKOUTS: ['workouts'] as const,
  WORKOUT_DETAIL: (id: string) => ['workouts', id] as const,
  WORKOUT_STEPS: (workoutId: string) => ['workout_steps', workoutId] as const,
  WORKOUT_SESSIONS: ['workout_sessions'] as const,
} as const;
```

**Tamamlandı mı?** `npm run dev` çalışıyor, TypeScript hataları yok.

---

## Phase 1 — Auth

### Step 1.1 — Supabase Auth Türleri

`src/types/auth.ts`:
```ts
export interface AuthUser {
  id: string;
  email: string;
}
```

### Step 1.2 — Auth Store

`src/store/authStore.ts` — Zustand slice:
- `session: Session | null`
- `user: AuthUser | null`
- `isLoading: boolean`
- `setSession(session: Session | null): void`
- `logout(): void` — `supabase.auth.signOut()` çağır, `queryClient.clear()` çalıştır

`supabase.auth.onAuthStateChange` listener'ı `main.tsx` veya auth store init'inde başlat.

### Step 1.3 — AuthLayout

`src/components/layout/AuthLayout.tsx`:
- Tam ekran, dikey ve yatay ortada bir kart (`<Card>` Ant Design)
- Kart genişliği 420px, arka plan `colorBgContainer`
- Üstte uygulama adı "FitTrack" `display-font` class ile
- Alt kısım: `children` prop

### Step 1.4 — Login Sayfası

`src/features/auth/LoginPage.tsx`:
- React Hook Form + Zod schema
- `email: z.string().email('Geçerli bir e-posta girin')`
- `password: z.string().min(6, 'En az 6 karakter')`
- Ant Design `<Input>` ve `<Input.Password>` bileşenleri
- Submit: `supabase.auth.signInWithPassword({ email, password })`
- Başarılı: `navigate(ROUTES.DASHBOARD)`
- Hata: `<Alert type="error" message="..." />` inline

### Step 1.5 — ProtectedRoute

`src/router/ProtectedRoute.tsx`:
- `authStore.session` null ise `<Navigate to={ROUTES.LOGIN} replace />`
- `authStore.isLoading` true ise `<Spin />` göster
- Değilse `<Outlet />`

### Step 1.6 — Router Yapısı

`src/router/index.tsx` — `createBrowserRouter` ile:
- `/login` → `AuthLayout` > `LoginPage` (lazy)
- `/` → `ProtectedRoute` > `AppLayout` > route'lar (lazy)

**Tamamlandı mı?** Login çalışıyor, oturum sonrası dashboard'a yönlendiriyor, korumalı route'lar login'e yönlendiriyor.

---

## Phase 2 — Layout

### Step 2.1 — AppLayout

`src/components/layout/AppLayout.tsx`:
- Ant Design `<Layout>` kullan
- Sol: `<Layout.Sider>` 220px, sabit, beyaz arka plan
- Sağ: `<Layout.Content>` arka plan `colorBgLayout`, padding 40px
- Active workout route'unda (`/workouts/:id/start`) Sider gizlenir; tam genişlik

### Step 2.2 — Sidebar

`src/components/layout/Sidebar.tsx`:

Üstten aşağıya yapı:
```
[Logo: "FitTrack" display-font 18px bold]
[Subtitle: "Antrenman Takibi" 11px muted]
[Nav Menu]
  - Dashboard (HomeOutlined)
  - Hareketler (ThunderboltOutlined)
  - Antrenmanlar (PlayCircleOutlined)
[Alt: Kullanıcı e-postası + Çıkış butonu]
```

- Ant Design `<Menu>` bileşeni kullan, `mode="inline"`
- Aktif item `selectedKeys` ile React Router `useLocation()`'dan belirle
- Çıkış: `authStore.logout()` çağır, `/login`'e yönlendir

### Step 2.3 — Sayfa Başlığı Bileşeni

`src/components/ui/PageHeader.tsx`:
```tsx
interface Props {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;  // sağ tarafa action butonu
}
```
- `title`: `className="display-font"` ile `<Typography.Title level={2}>`
- `subtitle`: `<Typography.Text type="secondary">`
- `extra`: sağ tarafa hizalı

**Tamamlandı mı?** Tüm route'larda layout doğru görünüyor, sidebar nav çalışıyor, çıkış yapılabiliyor.

---

## Phase 3 — Hareketler (Exercises)

### Step 3.1 — Tipler

`src/features/exercises/types/index.ts`:
```ts
export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  youtube_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface ExerciseFormValues {
  name: string;
  description?: string;
  youtube_url?: string;
  image_url?: string;
}
```

### Step 3.2 — YouTube Util

`src/lib/youtubeUtils.ts`:
```ts
// youtube.com/watch?v=ID veya youtu.be/ID → youtube.com/embed/ID
export function getYouTubeEmbedUrl(url: string): string | null
```

### Step 3.3 — API Fonksiyonları

`src/features/exercises/api/exercisesApi.ts`:
- `getExercises(): Promise<Exercise[]>` — `supabase.from('exercises').select('*').order('created_at', { ascending: false })`
- `createExercise(values: ExerciseFormValues): Promise<Exercise>`
- `updateExercise(id: string, values: ExerciseFormValues): Promise<Exercise>`
- `deleteExercise(id: string): Promise<void>`

### Step 3.4 — Hooks

`src/features/exercises/hooks/useExercises.ts`:
- `useExercises()` → `useQuery(QUERY_KEYS.EXERCISES, getExercises)`
- `useCreateExercise()` → `useMutation` + `QUERY_KEYS.EXERCISES` invalidate
- `useUpdateExercise()` → `useMutation` + `QUERY_KEYS.EXERCISES` invalidate
- `useDeleteExercise()` → `useMutation` + `QUERY_KEYS.EXERCISES` invalidate

### Step 3.5 — Hareket Formu

`src/features/exercises/components/ExerciseForm.tsx`:
- React Hook Form + Zod schema
- Alanlar: `name` (zorunlu), `description` (opsiyonel), `youtube_url` (opsiyonel, URL formatı), `image_url` (opsiyonel, URL formatı)
- Ant Design `<Form.Item>` görsel sarmalayıcı, `<Controller>` ile RHF bağlantısı
- `youtube_url` girilmişse altında küçük bir embed önizleme (`getYouTubeEmbedUrl` ile)
- Kaydet / İptal butonları

### Step 3.6 — Hareket Drawer'ı

`src/features/exercises/components/ExerciseDrawer.tsx`:
- Ant Design `<Drawer>` — sağdan açılır, genişlik 480px
- Yeni ekle veya düzenle modunda çalışır (`exercise?: Exercise` prop)
- Başlık: "Yeni Hareket" / "Hareketi Düzenle"
- İçerik: `<ExerciseForm />`

### Step 3.7 — Hareket Kartı

`src/features/exercises/components/ExerciseCard.tsx`:
- Ant Design `<Card>` — `bordered={false}`, arka plan `colorBgContainer`
- Thumbnail: `image_url` varsa görsel, `youtube_url` varsa YouTube thumbnail (`https://img.youtube.com/vi/{ID}/mqdefault.jpg`), yoksa varsayılan ikon
- Hareket adı, kısa açıklama (max 2 satır, `ellipsis`)
- Sağ üst: Düzenle (EditOutlined) ve Sil (DeleteOutlined) ikon butonları
- Sil: `<Popconfirm>` ile onay al

### Step 3.8 — Hareketler Sayfası

`src/features/exercises/ExercisesPage.tsx`:
- `<PageHeader title="Hareketler" extra={<Button type="primary">Yeni Hareket</Button>} />`
- Ant Design `<Row gutter={[16, 16]}>` ile kart grid (3 kolon)
- Boş durum: `<Empty description="Henüz hareket eklenmedi" />`
- Yükleniyor: `<Skeleton />` kartlar
- Drawer state yönetimi (open, selectedExercise)

**Tamamlandı mı?** Hareketler CRUD çalışıyor, drawer açılıp kapanıyor, YouTube önizleme doğru.

---

## Phase 4 — Antrenmanlar (Workouts)

### Step 4.1 — Tipler

`src/features/workouts/types/index.ts`:
```ts
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WorkoutStep {
  id: string;
  workout_id: string;
  exercise_id: string | null;
  step_type: 'exercise' | 'rest';
  order_index: number;
  duration_seconds: number | null;
  reps: number | null;
  tracking_type: 'duration' | 'reps';
  exercise?: Exercise;  // join ile gelen
}

export interface WorkoutWithSteps extends Workout {
  steps: WorkoutStep[];
}

// Workout builder'da kullanılan lokal tip (henüz kaydedilmemiş adım)
export interface WorkoutStepDraft {
  tempId: string;  // crypto.randomUUID()
  exercise_id: string | null;
  step_type: 'exercise' | 'rest';
  duration_seconds: number | null;
  reps: number | null;
  tracking_type: 'duration' | 'reps';
  exercise?: Exercise;  // seçilmişse
}
```

### Step 4.2 — API Fonksiyonları

`src/features/workouts/api/workoutsApi.ts`:
- `getWorkouts(): Promise<Workout[]>`
- `getWorkoutWithSteps(id: string): Promise<WorkoutWithSteps>` — steps + exercise join
- `createWorkout(name: string, steps: WorkoutStepDraft[]): Promise<Workout>` — transaction: önce workout, sonra steps toplu insert
- `updateWorkout(id: string, name: string, steps: WorkoutStepDraft[]): Promise<void>` — mevcut steps'i sil, yenilerini ekle
- `deleteWorkout(id: string): Promise<void>`

### Step 4.3 — Hooks

`src/features/workouts/hooks/useWorkouts.ts`:
- `useWorkouts()`, `useWorkoutWithSteps(id)`, `useCreateWorkout()`, `useUpdateWorkout()`, `useDeleteWorkout()`
- Mutasyonlar ilgili query key'leri invalidate eder

### Step 4.4 — Antrenman Builder — Adım Bileşeni

`src/features/workouts/components/WorkoutStepItem.tsx`:

Her adım satırı şunları gösterir:
- Sürükleme tutacağı (DragOutlined ikon)
- Adım tipi badge'i: "Hareket" (mavi) / "Dinlenme" (turuncu)
- Hareket adı (exercise step) veya "Dinlenme" (rest step)
- Süre/tekrar değeri
- Sil butonu (DeleteOutlined)
- Tıklayınca inline düzenleme veya modal

### Step 4.5 — Antrenman Builder — Adım Ekleme

`src/features/workouts/components/AddStepButtons.tsx`:
- İki buton: "+ Hareket Ekle" ve "+ Dinlenme Ekle"
- "Hareket Ekle" tıklanınca: mevcut exercise listesinden seçim yapılan bir `<Modal>` açılır, arama ile filtrelenebilir
- "Dinlenme Ekle" tıklanınca: süre girilen küçük bir modal/popover açılır (default 30 sn)

### Step 4.6 — Antrenman Builder Sayfası

`src/features/workouts/WorkoutBuilderPage.tsx`:

Yapı:
```
[PageHeader: "Yeni Antrenman" / "Antrenmanı Düzenle"]
[Antrenman adı input — büyük, display font]
[Adım listesi — sürükle/bırak ile sıralama]
  [WorkoutStepItem x N]
[AddStepButtons]
[Kaydet butonu — sağ alt]
```

- Adım listesi sıralaması için `@dnd-kit/core` + `@dnd-kit/sortable` kullan
- Local state: `WorkoutStepDraft[]` dizisi
- Kaydet: `useCreateWorkout` veya `useUpdateWorkout` çağır, başarılı olunca `/workouts`'a yönlendir

> **Not:** `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` gerekli

### Step 4.7 — Antrenman Kartı

`src/features/workouts/components/WorkoutCard.tsx`:
- Ant Design `<Card>` — `bordered={false}`
- Antrenman adı (display font), adım sayısı ("5 hareket, 2 dinlenme")
- Toplam tahmini süre (tüm duration_seconds toplamı)
- Butonlar: "Başlat" (primary), "Düzenle" (default), "Sil" (popconfirm)

### Step 4.8 — Antrenmanlar Sayfası

`src/features/workouts/WorkoutsPage.tsx`:
- `<PageHeader title="Antrenmanlar" extra={<Button>Yeni Antrenman</Button>} />`
- Kart grid (2-3 kolon)
- Boş durum, yükleniyor skeleton

**Tamamlandı mı?** Antrenman oluşturma/düzenleme/silme çalışıyor, adım sıralaması çalışıyor, builder kayıt yapıyor.

---

## Phase 5 — Aktif Antrenman

### Step 5.1 — Active Workout Store

`src/store/activeWorkoutStore.ts` — Zustand:

```ts
interface ActiveWorkoutState {
  workoutId: string | null;
  steps: WorkoutStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  elapsedSeconds: number;        // toplam geçen süre (session süresi için)
  stepElapsedSeconds: number;    // mevcut adımda geçen süre (countdown için)
  
  startWorkout: (workout: WorkoutWithSteps) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeStep: () => void;      // sonraki adıma geç
  completeWorkout: () => void;   // session'ı kaydet
  resetWorkout: () => void;
  tickSecond: () => void;        // setInterval'dan çağrılır
}
```

### Step 5.2 — Timer Hook

`src/features/active-workout/hooks/useWorkoutTimer.ts`:
- `status === 'running'` iken her saniye `activeWorkoutStore.tickSecond()` çağırır
- `tickSecond`: `elapsedSeconds++`, `stepElapsedSeconds++`
- Duration adımı için: `stepElapsedSeconds >= step.duration_seconds` olunca `completeStep()` otomatik çağrılır
- Component unmount'ta interval temizlenir

### Step 5.3 — Adım İlerleme Göstergesi

`src/features/active-workout/components/StepProgressBar.tsx`:
- Ant Design `<Steps>` bileşeni, `direction="vertical"` veya yatay scroll
- Tamamlanan adımlar: `status="finish"`, mevcut: `status="process"`, gelecek: `status="wait"`
- Rest adımları farklı ikon ile (CoffeeOutlined)

### Step 5.4 — Timer Göstergesi

`src/features/active-workout/components/WorkoutTimer.tsx`:

Duration adımı için:
- Kalan süreyi büyük, display font ile göster (`MM:SS`)
- Ant Design `<Progress type="circle">` ile görsel countdown
- Renk: `colorPrimary` normal, sarı <10sn, kırmızı <5sn

Reps adımı için:
- Hedef tekrar sayısını büyük göster
- "Tamamlandı" butonu (primary, büyük)

### Step 5.5 — Video Embed

`src/features/active-workout/components/ExerciseVideoEmbed.tsx`:
- `youtube_url` varsa: `getYouTubeEmbedUrl()` ile transform et, `<iframe>` embed
- `image_url` varsa ve video yoksa: görsel göster
- İkisi de yoksa: basit ikon/placeholder
- Iframe: `width="100%" height="300"`, `allowFullScreen`

### Step 5.6 — Aktif Antrenman Sayfası

`src/features/active-workout/ActiveWorkoutPage.tsx`:

Tam sayfa yapısı (sidebar gizli):
```
[Üst bar: antrenman adı + "Duraklat" / "Bitir" butonu]
[Sol/Üst panel: ExerciseVideoEmbed + hareket adı + açıklama]
[Sağ/Alt panel: WorkoutTimer]
[Alt: StepProgressBar]
```

- Sayfa mount'ta `useWorkoutTimer` başlatılır
- `status === 'completed'` olunca Supabase'e `workout_sessions` kaydı yaz, `/workouts`'a yönlendir ve başarı `<message>` göster
- Tarayıcı sekmesi kapatılınca uyarı (`beforeunload` event) — "Antrenman devam ediyor, çıkmak istediğinize emin misiniz?"

**Tamamlandı mı?** Timer çalışıyor, adımlar sırayla geçiyor, video embed görünüyor, session kaydediliyor.

---

## Phase 6 — Dashboard

### Step 6.1 — Streak Utility

`src/lib/streakUtils.ts`:

```ts
export interface WorkoutStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  thisWeekSessions: number;
}

export function calculateStreak(completedDates: string[]): number
export function calculateStats(sessions: WorkoutSession[]): WorkoutStats
```

Kural: Günlük streak, kullanıcının lokal timezone'una göre takvim günü bazında hesaplanır.

### Step 6.2 — Session API + Hook

`src/features/dashboard/api/sessionsApi.ts`:
- `getWorkoutSessions(): Promise<WorkoutSession[]>` — son 90 gün, `completed_at` desc

`src/features/dashboard/hooks/useDashboard.ts`:
- `useWorkoutSessions()` → query
- `useDashboardStats()` → query sonucunu `calculateStats()` ile işler

### Step 6.3 — Streak Kartı

`src/features/dashboard/components/StreakCard.tsx`:
- Ant Design `<Card>` — `bordered={false}`
- Büyük sayı (display font): mevcut streak gün sayısı
- Alt yazı: "günlük seri" 
- Yan bilgi: "En uzun seri: X gün"
- Ateş ikonu (🔥 veya FireOutlined) — streak > 0 ise renkli, değilse gri

### Step 6.4 — İstatistik Kartları

`src/features/dashboard/components/StatsGrid.tsx`:
- 3 adet `<Card>` yan yana (Ant Design `<Row gutter={16}>`)
- Kart 1: Toplam antrenman
- Kart 2: Bu haftaki antrenman
- Kart 3: Toplam hareket sayısı (exercises tablosundan)

### Step 6.5 — Son Aktivite

`src/features/dashboard/components/RecentActivity.tsx`:
- Son 5 tamamlanan session
- Her satır: antrenman adı, tarih, süre (MM:DD formatında)
- Ant Design `<List>` bileşeni
- Boş durum: "Henüz antrenman tamamlanmadı. Hadi başlayalım! 💪"

### Step 6.6 — Dashboard Sayfası

`src/features/dashboard/DashboardPage.tsx`:
```
[PageHeader: "Merhaba 👋", subtitle: kullanıcı e-postası]
[StreakCard — tam genişlik veya geniş]
[StatsGrid]
[RecentActivity]
[Kısa yol: "Antrenman Başlat" butonu → /workouts]
```

**Tamamlandı mı?** Streak hesaplanıyor, istatistikler doğru, son aktivite listeleniyor.

---

## Phase 7 — Polish & Deploy

### Step 7.1 — Boş Durum Tutarlılığı

Tüm sayfalarda boş durum kontrolü: `<Empty>` bileşeni, anlamlı açıklama metni ve aksiyon butonu.

### Step 7.2 — Yükleniyor Durumları

Tüm liste ve kart alanlarında `isLoading` durumunda Ant Design `<Skeleton>` göster.

### Step 7.3 — Hata Durumları

`isError` durumunda `<Alert type="error" message="Veriler yüklenemedi." showIcon />` + "Tekrar Dene" butonu.

### Step 7.4 — Responsive Kontrol

- Sidebar 768px altında otomatik gizlenir (`<Layout.Sider breakpoint="md" collapsedWidth={0}>`)
- Kart grid'leri mobilde tek kolon olur (`<Col xs={24} sm={12} lg={8}>`)

### Step 7.5 — Environment Variables

`vercel.json` veya Netlify dashboard'da şu değişkenleri ekle:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Step 7.6 — Build Kontrolü

```bash
npm run build
```
Uyarı ve hata sıfır olmalı.

### Step 7.7 — Deploy

**Vercel:**
```bash
npx vercel --prod
```

**veya Netlify:**
- `dist/` klasörünü drag & drop
- Build command: `npm run build`, publish dir: `dist`

---

## Bug Fix Kaydı

Bu bölüm geliştirme sırasında keşfedilen ve çözülen bugları belgeler.
Yeni bir bug çözüldüğünde buraya ekle:

```
### BF-[N] — [Kısa Başlık] ([Tarih])
**Sorun:** ...
**Kök neden:** ...
**Değişen dosyalar:** ...
```

---

*Last updated: 2026-05-19*
