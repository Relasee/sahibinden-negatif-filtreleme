// popup.js - Enhanced version with better error handling
document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keywordInput');
    const addKeywordButton = document.getElementById('addKeywordButton');
    const keywordList = document.getElementById('keywordList');
    const clearAllButton = document.getElementById('clearAllButton');

    // Status mesajı gösterme fonksiyonu
    function showStatus(message, isError = false) {
        // Mevcut status mesajını kaldır
        const existingStatus = document.querySelector('.status-message');
        if (existingStatus) {
            existingStatus.remove();
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message p-2 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        statusDiv.textContent = message;
        
        // Input'un altına ekle
        keywordInput.parentNode.insertAdjacentElement('afterend', statusDiv);
        
        // 3 saniye sonra kaldır
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    // Sahibinden.com sayfasında olup olmadığını kontrol et
    function checkIfOnSahibinden() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    const url = tabs[0].url;
                    const isSahibinden = url.includes('sahibinden.com');
                    resolve({ isSahibinden, url });
                } else {
                    resolve({ isSahibinden: false, url: '' });
                }
            });
        });
    }

    // Anahtar kelimeleri storage'dan yükle ve listeyi güncelle
    function loadKeywords() {
        chrome.storage.sync.get(['negativeKeywords'], (result) => {
            const keywords = result.negativeKeywords || [];
            displayKeywords(keywords);
        });
    }

    // Anahtar kelimeleri UI'da göster
    function displayKeywords(keywords) {
        keywordList.innerHTML = '';
        if (keywords.length === 0) {
            keywordList.innerHTML = '<p class="text-gray-500 text-sm text-center">Henüz negatif anahtar kelime eklenmedi.</p>';
            return;
        }
        keywords.forEach((keyword, index) => {
            const keywordItem = document.createElement('div');
            keywordItem.className = 'keyword-item';
            keywordItem.innerHTML = `
                <span class="font-medium">${keyword}</span>
                <button data-index="${index}" class="text-xs">Kaldır</button>
            `;
            keywordList.appendChild(keywordItem);
        });
    }

    // Content script'e mesaj gönderme fonksiyonu (gelişmiş)
    async function sendMessageToContentScript(type, data) {
        try {
            const { isSahibinden, url } = await checkIfOnSahibinden();
            
            if (!isSahibinden) {
                showStatus('Bu sayfa Sahibinden.com değil. Lütfen Sahibinden.com\'da bir otomobil arama sayfasına gidin.', true);
                return false;
            }

            return new Promise((resolve) => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: type,
                            keywords: data
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("Content script mesaj hatası:", chrome.runtime.lastError.message);
                                
                                // Content script yüklenmemişse yeniden yükle
                                if (chrome.runtime.lastError.message.includes('Could not establish connection')) {
                                    chrome.scripting.executeScript({
                                        target: { tabId: tabs[0].id },
                                        files: ['content.js']
                                    }, () => {
                                        if (chrome.runtime.lastError) {
                                            showStatus('Extension yüklenirken hata oluştu. Sayfayı yenileyin.', true);
                                            resolve(false);
                                        } else {
                                            // Yeniden dene
                                            setTimeout(() => {
                                                chrome.tabs.sendMessage(tabs[0].id, {
                                                    type: type,
                                                    keywords: data
                                                }, (retryResponse) => {
                                                    if (retryResponse && retryResponse.status === 'applied') {
                                                        showStatus(`Filtre uygulandı: ${retryResponse.filteredCount} ilan gizlendi`);
                                                        resolve(true);
                                                    } else {
                                                        showStatus('Filtre uygulanamadı', true);
                                                        resolve(false);
                                                    }
                                                });
                                            }, 500);
                                        }
                                    });
                                } else {
                                    showStatus('Content script ile bağlantı kurulamadı', true);
                                    resolve(false);
                                }
                            } else if (response && response.status === 'applied') {
                                showStatus(`Filtre uygulandı: ${response.filteredCount} ilan gizlendi`);
                                resolve(true);
                            } else {
                                showStatus('Filtre uygulanamadı', true);
                                resolve(false);
                            }
                        });
                    } else {
                        showStatus('Aktif sekme bulunamadı', true);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            showStatus('Bir hata oluştu', true);
            return false;
        }
    }

    // Yeni anahtar kelime ekle
    addKeywordButton.addEventListener('click', async () => {
        const newKeyword = keywordInput.value.trim().toLowerCase();
        if (!newKeyword) {
            showStatus('Lütfen bir anahtar kelime girin', true);
            return;
        }

        if (newKeyword.length < 2) {
            showStatus('Anahtar kelime en az 2 karakter olmalı', true);
            return;
        }

        chrome.storage.sync.get(['negativeKeywords'], async (result) => {
            const keywords = result.negativeKeywords || [];
            if (keywords.includes(newKeyword)) {
                showStatus('Bu anahtar kelime zaten ekli', true);
                return;
            }

            keywords.push(newKeyword);
            chrome.storage.sync.set({ negativeKeywords: keywords }, async () => {
                keywordInput.value = '';
                loadKeywords();
                await sendMessageToContentScript('applyFilter', keywords);
            });
        });
    });

    // Enter tuşu ile ekleme
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addKeywordButton.click();
        }
    });

    // Anahtar kelimeyi kaldır
    keywordList.addEventListener('click', async (event) => {
        if (event.target.tagName === 'BUTTON') {
            const indexToRemove = parseInt(event.target.dataset.index);
            chrome.storage.sync.get(['negativeKeywords'], async (result) => {
                let keywords = result.negativeKeywords || [];
                const removedKeyword = keywords[indexToRemove];
                keywords.splice(indexToRemove, 1);
                
                chrome.storage.sync.set({ negativeKeywords: keywords }, async () => {
                    loadKeywords();
                    showStatus(`"${removedKeyword}" kaldırıldı`);
                    await sendMessageToContentScript('applyFilter', keywords);
                });
            });
        }
    });

    // Tüm anahtar kelimeleri temizle
    clearAllButton.addEventListener('click', async () => {
        const confirmed = confirm('Tüm negatif anahtar kelimeleri silmek istediğinizden emin misiniz?');
        if (confirmed) {
            chrome.storage.sync.set({ negativeKeywords: [] }, async () => {
                loadKeywords();
                showStatus('Tüm anahtar kelimeler temizlendi');
                await sendMessageToContentScript('applyFilter', []);
            });
        }
    });

    // Sayfa yüklendiğinde kontrol ve yükleme
    async function initialize() {
        const { isSahibinden, url } = await checkIfOnSahibinden();
        
        if (!isSahibinden) {
            // Uyarı mesajı göster
            const warningDiv = document.createElement('div');
            warningDiv.className = 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm mb-3';
            warningDiv.innerHTML = `
                <div class="font-medium">⚠️ Sahibinden.com'da değilsiniz</div>
                <div class="text-xs mt-1">Bu extension sadece Sahibinden.com otomobil sayfalarında çalışır.</div>
            `;
            document.querySelector('.container').insertBefore(warningDiv, document.querySelector('h2').nextSibling);
        }

        loadKeywords();
    }

    initialize();
});