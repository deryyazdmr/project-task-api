# Project Task API

Kullanıcıların kayıt olup giriş yapabildiği, kendi projelerini ve
bu projelere bağlı görevleri yönetebildiği REST API.

## Teknolojiler

- TypeScript
- NestJS
- SQLite
- Prisma
- JWT
- Argon2
- Jest ve Supertest

## Özellikler

- Kullanıcı kaydı ve giriş
- Parolaların Argon2 ile hashlenmesi
- Bir saat geçerli JWT ile kimlik doğrulama
- Kullanıcıya ait projelerde oluşturma, listeleme, detay, güncelleme ve silme
- Projelere bağlı görevlerde oluşturma, listeleme, detay, güncelleme ve silme
- Kullanıcılar arasında veri erişiminin sınırlandırılması
- DTO ve ValidationPipe ile istek doğrulaması
- Proje silindiğinde bağlı görevlerin otomatik silinmesi

## Gereksinimler

Geliştirme ve test sırasında Node.js 22.20.0 kullanıldı.
Paket kurulumu için npm gerekir.

Komutları proje kökünde çalıştırın.

## Kurulum

### 1. Paketleri yükleyin

```bash
npm ci
```

### 2. Ortam dosyasını oluşturun

.env.example dosyasını .env adıyla kopyalayın.

PowerShell:

```powershell
Copy-Item .env.example .env
```

JWT anahtarı üretin:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Üretilen değeri .env dosyasındaki JWT_SECRET alanına yazın:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="kendi_urettiginiz_rastgele_anahtar"
```

Gerçek .env dosyasını Git'e eklemeyin.

### 3. Prisma Client oluşturun

```bash
npx prisma generate --config ./prisma7.config.ts
```

### 4. Veritabanını hazırlayın

```bash
npx prisma migrate deploy --config ./prisma7.config.ts
```

Bu komut mevcut migration dosyalarını uygular.
Yeni bir model değişikliği geliştirilirken migration oluşturmak için:

```bash
npx prisma migrate dev --name degisiklik_adi --config ./prisma7.config.ts
```

### 5. Uygulamayı başlatın

```bash
npm run start:dev
```

Varsayılan adres: http://localhost:3000

Veritabanı başlangıçta boştur. Önce kayıt olup giriş yapın.

## Kimlik doğrulama

### Kayıt

POST /auth/register

```json
{
  "email": "user@example.com",
  "password": "Deneme123!"
}
```

Parola 8–128 karakter arasında olmalıdır.
Aynı e-posta adresiyle tekrar kayıt yapılamaz.

### Giriş

POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "Deneme123!"
}
```

Başarılı cevap:

```json
{
  "access_token": "JWT_TOKEN"
}
```

Korunan endpoint'lerde aşağıdaki başlığı gönderin:

```http
Authorization: Bearer JWT_TOKEN
```

Postman'da Authorization → Bearer Token alanına yalnızca tokenı yazın.

## Endpoint'ler

Proje ve görev endpoint'lerinin tamamı JWT gerektirir.

| Metot | Adres | İşlem |
|---|---|---|
| POST | /auth/register | Kayıt |
| POST | /auth/login | Giriş |
| POST | /projects | Proje oluşturma |
| GET | /projects | Kendi projelerini listeleme |
| GET | /projects/:id | Proje detayı |
| PATCH | /projects/:id | Proje güncelleme |
| DELETE | /projects/:id | Proje silme |
| POST | /projects/:projectId/tasks | Görev oluşturma |
| GET | /projects/:projectId/tasks | Görev listeleme |
| GET | /projects/:projectId/tasks/:taskId | Görev detayı |
| PATCH | /projects/:projectId/tasks/:taskId | Görev güncelleme |
| DELETE | /projects/:projectId/tasks/:taskId | Görev silme |

## Örnek istek gövdeleri

### Proje oluşturma

```json
{
  "name": "Backend projesi",
  "description": "Staj çalışması"
}
```

Proje sahibi, doğrulanmış token üzerinden belirlenir.
İstek gövdesinde userId gönderilmez.

### Görev oluşturma

```json
{
  "title": "Testleri tamamla",
  "description": "Erişim kontrollerini doğrula"
}
```

Yeni görev completed: false değeriyle başlar.

### Görev güncelleme

```json
{
  "completed": true
}
```

PATCH isteklerinde yalnızca değiştirilecek alanlar gönderilebilir.
Boolean değerler tırnaksız yazılmalıdır.

## Veri modeli

- Bir User birden fazla Project kaydına sahip olabilir.
- Her Project bir User kaydına aittir.
- Bir Project birden fazla Task içerebilir.
- Her Task bir Project kaydına aittir.
- Proje silinince bağlı görevler de silinir.

Görevlere erişim, bağlı projenin sahibi üzerinden kontrol edilir.
Başkasına ait veya bulunmayan kayıtlar için 404 döndürülür.

## Hata cevapları

| Kod | Anlamı |
|---|---|
| 400 | Geçersiz istek verisi veya ID |
| 401 | Eksik/geçersiz token veya hatalı giriş bilgileri |
| 404 | Kayıt bulunamadı veya kullanıcıya ait değil |
| 409 | E-posta zaten kayıtlı |

## Testler

Controller ve service testleri:

```bash
npm test -- --runInBand
```

Uçtan uca test:

```bash
npm run test:e2e -- --runInBand
```

E2E testi geçici bir klasörde ayrı SQLite veritabanı oluşturur,
migration'ları uygular ve test sonunda temizler.

Senaryolar kayıt, giriş, kullanıcılar arası erişim engeli,
görev doğrulaması, görev güncelleme ve cascade silmeyi kapsar.

Jest'in ESM çalıştırılması nedeniyle ExperimentalWarning görülebilir.
Bu uyarı tek başına test başarısızlığı anlamına gelmez.

## Kod kontrolleri

```bash
npm run build
npm run lint
```

## Kapsam

Bu proje backend API'dir; frontend içermez.
Refresh token ve token iptal mekanizması mevcut kapsamda yoktur.