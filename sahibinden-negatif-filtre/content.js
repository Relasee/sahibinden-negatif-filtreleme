// content.js - Updated version with better selectors

let currentNegativeKeywords = []; // Negatif anahtar kelimeleri tutacak dizi

// İlanları filtreleme fonksiyonu
function filterListings() {
    console.log("Filtreleme başlatılıyor. Negatif anahtar kelimeler:", currentNegativeKeywords);

    // Çoklu seçici stratejisi - farklı sayfalar için farklı yapılar
    let listingItems = [];
    
    // Arama sonuçları sayfası için seçiciler
    const searchResultSelectors = [
        'tr.searchResultsItem',           // Ana arama sonuçları
        'tr[data-id]',                    // Data-id attribute'u olan tr'ler
        'tbody.searchResultsRowClass tr', // Mevcut seçici
        '.searchResultsItem',             // Class bazlı seçim
        'tr:has(a[href*="/ilan/"])',      // İlan linki içeren tr'ler
        'tr:has(.classifiedTitle)',       // Başlık içeren tr'ler
    ];

    // Kategori sayfası için seçiciler
    const categorySelectors = [
        '.classified-item',
        '.listing-item',
        'div[data-id]',
        '.searchResultsItem'
    ];

    // Farklı seçicileri dene
    for (const selector of searchResultSelectors) {
        try {
            const items = document.querySelectorAll(selector);
            if (items.length > 0) {
                listingItems = Array.from(items);
                console.log(`${items.length} ilan bulundu (seçici: ${selector})`);
                break;
            }
        } catch (e) {
            console.warn(`Seçici hatası: ${selector}`, e);
        }
    }

    // Eğer tr bazlı seçiciler çalışmazsa, div bazlı dene
    if (listingItems.length === 0) {
        for (const selector of categorySelectors) {
            try {
                const items = document.querySelectorAll(selector);
                if (items.length > 0) {
                    listingItems = Array.from(items);
                    console.log(`${items.length} ilan bulundu (seçici: ${selector})`);
                    break;
                }
            } catch (e) {
                console.warn(`Seçici hatası: ${selector}`, e);
            }
        }
    }

    if (listingItems.length === 0) {
        console.warn("Hiç ilan bulunamadı. Sayfa yapısı değişmiş olabilir.");
        return 0;
    }

    let filteredCount = 0;

    listingItems.forEach((item, index) => {
        try {
            // Metin içeriğini almak için çoklu strateji
            let allText = '';
            
            // Başlık için çoklu seçici
            const titleSelectors = [
                '.classifiedTitle',
                'a[href*="/ilan/"]',
                '.classified-title',
                '.listing-title',
                'h3',
                'h2',
                '[class*="title"]',
                'a:first-of-type'
            ];

            // Açıklama için çoklu seçici
            const descriptionSelectors = [
                '.description',
                '.classified-description',
                '.listing-description',
                '[class*="description"]',
                'p',
                '.searchResultsTagAttributeValue'
            ];

            // Başlık metnini bul
            let titleText = '';
            for (const selector of titleSelectors) {
                const titleElement = item.querySelector(selector);
                if (titleElement) {
                    titleText = titleElement.innerText || titleElement.textContent || '';
                    if (titleText.trim()) break;
                }
            }

            // Açıklama metnini bul
            let descriptionText = '';
            for (const selector of descriptionSelectors) {
                const descElement = item.querySelector(selector);
                if (descElement) {
                    descriptionText = descElement.innerText || descElement.textContent || '';
                    if (descriptionText.trim()) break;
                }
            }

            // Tüm metin içeriğini al (fallback)
            if (!titleText && !descriptionText) {
                allText = item.innerText || item.textContent || '';
            } else {
                allText = (titleText + ' ' + descriptionText).toLowerCase();
            }

            // Negatif kelime kontrolü
            let isNegative = false;
            if (currentNegativeKeywords && currentNegativeKeywords.length > 0 && allText) {
                isNegative = currentNegativeKeywords.some(keyword => 
                    allText.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            if (isNegative) {
                item.style.display = 'none'; // İlanı gizle
                item.setAttribute('data-filtered', 'true'); // İşaretleme ekle
                filteredCount++;
                console.log(`Gizlenen ilan #${index + 1}:`, titleText.substring(0, 50) + '...');
            } else {
                item.style.display = ''; // İlanı görünür yap
                item.removeAttribute('data-filtered');
            }
        } catch (error) {
            console.warn(`İlan #${index + 1} işlenirken hata:`, error);
        }
    });

    console.log(`Filtreleme tamamlandı. ${filteredCount} ilan gizlendi.`);
    return filteredCount;
}

// Gelişmiş DOM değişiklik gözlemcisi
const observer = new MutationObserver((mutations) => {
    let shouldFilter = false;
    
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            // Yeni eklenen node'ları kontrol et
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // İlan benzeri elementler eklendiğinde filtrele
                    if (node.matches && (
                        node.matches('tr') || 
                        node.matches('.searchResultsItem') ||
                        node.matches('[data-id]') ||
                        node.matches('.classified-item') ||
                        node.querySelector('a[href*="/ilan/"]')
                    )) {
                        shouldFilter = true;
                        break;
                    }
                }
            }
        }
        
        if (shouldFilter) break;
    }
    
    if (shouldFilter) {
        // Kısa bir gecikme ile filtrele (DOM'un tam yüklenmesini bekle)
        setTimeout(() => {
            filterListings();
        }, 100);
    }
});

// Gözlemciyi başlat - daha geniş kapsam
function startObserver() {
    // Ana sayfa konteynerını bul
    const containers = [
        document.querySelector('tbody.searchResultsRowClass'),
        document.querySelector('#searchResultsTable'),
        document.querySelector('.searchResults'),
        document.querySelector('main'),
        document.querySelector('#content'),
        document.body
    ].filter(Boolean);

    if (containers.length > 0) {
        const container = containers[0];
        observer.observe(container, { 
            childList: true, 
            subtree: true,
            attributes: false,
            attributeOldValue: false
        });
        console.log("MutationObserver başlatıldı:", container.tagName, container.className);
    } else {
        console.warn("Uygun konteyner bulunamadı, body gözlemleniyor.");
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// Sayfa yüklenme kontrolü
function waitForPageLoad() {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
}

// Popup scriptinden gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'applyFilter') {
        currentNegativeKeywords = request.keywords;
        const count = filterListings();
        sendResponse({ status: 'applied', filteredCount: count });
    }
    return true;
});

// Sayfa hazır olduğunda başlat
async function initializeExtension() {
    try {
        await waitForPageLoad();
        
        // Storage'dan anahtar kelimeleri yükle
        chrome.storage.sync.get(['negativeKeywords'], (result) => {
            currentNegativeKeywords = result.negativeKeywords || [];
            console.log("Yüklenen negatif kelimeler:", currentNegativeKeywords);
            
            // İlk filtrelemeyi yap
            setTimeout(() => {
                filterListings();
            }, 500);
            
            // Observer'ı başlat
            startObserver();
        });
        
        // Sayfa değişikliklerini izle (SPA navigasyonu için)
        let currentUrl = window.location.href;
        const urlObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log("URL değişti, yeniden filtreleniyor:", currentUrl);
                setTimeout(() => {
                    filterListings();
                }, 1000);
            }
        });
        
        urlObserver.observe(document.body, { childList: true, subtree: true });
        
    } catch (error) {
        console.error("Extension başlatma hatası:", error);
    }
}

// Extension'ı başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}