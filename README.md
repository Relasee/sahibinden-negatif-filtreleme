# **Sahibinden.com Negatif Filtreleme Uzantısı**

Bu tarayıcı uzantısı, Sahibinden.com'daki otomobil ilanlarını, belirlediğiniz negatif anahtar kelimelere göre filtrelemenizi sağlar. Örneğin, "taksi çıkması" gibi kelimeleri içeren ilanları otomatik olarak gizleyerek arama sonuçlarınızda görünmemelerini sağlayabilirsiniz.

## **Özellikler**

* **Negatif Anahtar Kelime Filtreleme:** İlan başlıklarında veya açıklamalarında belirlediğiniz kelimeleri içeren ilanları gizler.  
* **Dinamik İçerik Desteği:** Sahibinden.com'un dinamik olarak yüklenen içeriklerini (örneğin, aşağı kaydırdıkça gelen yeni ilanlar) MutationObserver kullanarak algılar ve filtrelemeyi uygular.  
* **Kolay Yönetim:** Tarayıcı araç çubuğundaki uzantı simgesine tıklayarak açılan popup penceresi üzerinden negatif anahtar kelimelerinizi kolayca ekleyebilir, kaldırabilir ve yönetebilirsiniz.  
* **Kalıcı Depolama:** Eklediğiniz anahtar kelimeler tarayıcınızın yerel depolama alanında saklanır, böylece tarayıcıyı kapatsanız bile ayarlarınız korunur.

## **Nasıl Çalışır?**

Uzantı, Sahibinden.com'un otomobil ilan sayfalarına (veya genel arama sonuçlarına) özel bir JavaScript kodu (content.js) enjekte eder. Bu kod, sayfa yüklendiğinde ve dinamik olarak yeni ilanlar eklendiğinde devreye girer:

1. Sayfadaki tüm ilan öğelerini tespit eder.  
2. Her bir ilanın başlığını ve açıklamasını okur.  
3. Kullanıcının belirlediği negatif anahtar kelimelerden herhangi birini içerip içermediğini kontrol eder.  
4. Negatif anahtar kelime içeren ilanları sayfadan gizler (display: none stilini uygulayarak).

## **Kurulum**

Bu uzantıyı Chrome tarayıcınıza yüklemek için aşağıdaki adımları izleyin:

1. Bu projenin tüm dosyalarını ( manifest.json, popup.html, popup.js, content.js ve icons klasörü) bilgisayarınızda tek bir klasöre indirin veya kopyalayın.  
2. Chrome tarayıcınızı açın ve adres çubuğuna chrome://extensions yazarak Uzantılar sayfasına gidin.  
3. Sağ üst köşedeki "Geliştirici modu" (Developer mode) anahtarını açın.  
4. Sol üstte beliren "Paketlenmemiş uzantıyı yükle" (Load unpacked) düğmesine tıklayın.  
5. Adım 1'de indirdiğiniz/kopyaladığınız klasörü seçin ve "Klasörü Seç" düğmesine tıklayın.  
6. Uzantı başarıyla yüklendiğinde, tarayıcınızın araç çubuğunda uzantı simgesini görmelisiniz.

## **Kullanım**

1. Tarayıcı araç çubuğundaki **Sahibinden Negatif Filtre** uzantı simgesine tıklayın.  
2. Açılan küçük pencerede, "Kelime ekle" alanına filtrelemek istediğiniz negatif anahtar kelimeyi (örneğin: "taksi çıkması", "hasar kayıtlı", "pert") yazın.  
3. "Ekle" düğmesine tıklayın. Kelime listenize eklenecektir.  
4. Eklediğiniz kelimeleri listede görebilirsiniz. Bir kelimeyi kaldırmak için yanındaki "Kaldır" düğmesine tıklayın.  
5. Tüm anahtar kelimeleri temizlemek için "Tümünü Temizle" düğmesini kullanın.  
6. Sahibinden.com'daki otomobil ilan sayfalarına gidin. Eklediğiniz negatif anahtar kelimeleri içeren ilanlar otomatik olarak gizlenecektir.


## **Katkıda Bulunma**

Eğer bu uzantıyı geliştirmek veya sorunları gidermek isterseniz, projenin GitHub deposuna pull request gönderebilirsiniz.
