# Praytime - GNOME Shell Extension

GNOME Shell için namaz vakitleri bildirimi ve panel gösterimi extension'ı.

## Özellikler

- Panel üzerinde sonraki namaz vakti ve geri sayım
- 6 vakit desteği: İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı
- Otomatik konum tespiti (GeoClue2)
- Manuel konum girişi
- Vakit girişi ve öncesi bildirimleri
- Türkçe arayüz
- Clean Architecture mimari yapısı

## Gereksinimler

- GNOME Shell 46, 47 veya 48
- GeoClue2 (otomatik konum için)
- İnternet bağlantısı (API erişimi için)

## Kurulum

### Yöntem 1: Manuel Kurulum

```bash
# Projeyi klonla
git clone https://github.com/erhanurgun/LINUX-ubuntu-gnome-praytime-extension.git
cd LINUX-ubuntu-gnome-praytime-extension

# Extension klasörüne kopyala
mkdir -p ~/.local/share/gnome-shell/extensions/praytime@erho.dev
cp -r * ~/.local/share/gnome-shell/extensions/praytime@erho.dev/

# Schema derle
glib-compile-schemas ~/.local/share/gnome-shell/extensions/praytime@erho.dev/schemas/
```

### Yöntem 2: Zip ile Kurulum

```bash
# Projeyi zip olarak indir ve çıkart
unzip LINUX-ubuntu-gnome-praytime-extension.zip -d praytime

# Extension klasörüne kopyala
mkdir -p ~/.local/share/gnome-shell/extensions/praytime@erho.dev
cp -r praytime/* ~/.local/share/gnome-shell/extensions/praytime@erho.dev/

# Schema derle
glib-compile-schemas ~/.local/share/gnome-shell/extensions/praytime@erho.dev/schemas/
```

### Yöntem 3: GNOME Extensions Sitesi (Yakında)

Extension onaylandıktan sonra [extensions.gnome.org](https://extensions.gnome.org) üzerinden kurulabilecek.

## GNOME Shell'i Yeniden Başlatma

### X11 Kullanıyorsanız

```bash
# Alt+F2 tuşuna basıp "r" yazın ve Enter'a basın
```

### Wayland Kullanıyorsanız

```bash
# Oturumu kapatıp yeniden açın
```

## Extension'ı Etkinleştirme

### Terminal ile

```bash
# Etkinleştir
gnome-extensions enable praytime@erho.dev

# Devre dışı bırak
gnome-extensions disable praytime@erho.dev

# Durumunu kontrol et
gnome-extensions show praytime@erho.dev
```

### GNOME Extensions Uygulaması ile

```bash
# GNOME Extensions uygulamasını aç
gnome-extensions-app
```

Uygulama açıldıktan sonra "Praytime" extension'ını bulup açma/kapama anahtarını kullanın.

### GNOME Tweaks ile

```bash
# GNOME Tweaks yükle (yoksa)
sudo apt install gnome-tweaks

# GNOME Tweaks'i aç
gnome-tweaks
```

"Uzantılar" (Extensions) sekmesinden "Praytime" extension'ını etkinleştirin.

## Kullanım

Extension etkinleştirildikten sonra GNOME Shell panelinde sonraki namaz vakti ve geri sayım görünür.

### Panel Görünümü

```
Öğle 12:30 (2:15:30)
```

- **Öğle**: Sonraki vakit adı
- **12:30**: Vakit saati
- **(2:15:30)**: Kalan süre (saat:dakika:saniye)

### Menü

Panel butonuna tıklayarak:
- Tüm vakitleri görebilirsiniz
- Konum bilgisini görebilirsiniz
- Ayarlara erişebilirsiniz

## Ayarlar

Ayarlar penceresine erişmek için:

```bash
# Terminal ile
gnome-extensions prefs praytime@erho.dev

# Veya panel menüsünden "Ayarlar" butonuna tıklayın
```

### Konum Ayarları

- **Manuel Konum Kullan**: Otomatik konum yerine manuel koordinat kullan
- **Şehir Adı**: Gösterilecek şehir adı
- **Enlem/Boylam**: Manuel koordinatlar

### Bildirim Ayarları

- **Bildirimleri Etkinleştir**: Bildirim gösterimini aç/kapat
- **Önceden Bildir**: Vakit girmeden kaç dakika önce bildirim göster (1-30)
- **Vakit Girince Bildir**: Vakit tam girdiğinde bildirim göster

### Gösterim Ayarları

- **Geri Sayım Göster**: Panelde kalan süreyi göster
- **Panel Konumu**: Extension'ın paneldeki konumu (Sol/Orta/Sağ)

## Hata Ayıklama

### Log'ları Görüntüleme

```bash
# GNOME Shell log'larını görüntüle
journalctl -f -o cat /usr/bin/gnome-shell | grep -i praytime

# Veya
journalctl -f -o cat GNOME_SHELL_EXTENSION_UUID=praytime@erho.dev
```

### Extension'ı Sıfırlama

```bash
# Ayarları sıfırla
dconf reset -f /org/gnome/shell/extensions/praytime/

# Extension'ı yeniden yükle
gnome-extensions disable praytime@erho.dev
gnome-extensions enable praytime@erho.dev
```

## Proje Yapısı

```
praytime@erho.dev/
├── metadata.json           # Extension meta bilgileri
├── extension.js            # Ana extension sınıfı
├── prefs.js               # Ayarlar penceresi
├── stylesheet.css         # UI stilleri
├── schemas/               # GSettings şemaları
└── src/
    ├── domain/            # İş mantığı modelleri
    │   └── models/
    ├── infrastructure/    # Dış sistemler (API, GeoClue2)
    │   ├── api/
    │   └── location/
    ├── application/       # Servis katmanı
    └── presentation/      # UI bileşenleri
```

## API

Bu extension [prayertimes.api.abdus.dev](https://prayertimes.api.abdus.dev) API'sini kullanmaktadır.

## Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'e push'layın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## Lisans

MIT License

## Yazar

Erhan Ürgün

## Sürüm Geçmişi

Detaylı değişiklik geçmişi için [CHANGELOG.md](CHANGELOG.md) dosyasına bakın.
