/**
 * Cross-Device Compatible Application Initialization
 * Simplified for maximum compatibility across all browsers and devices
 */

(function() {
    'use strict';
    
    console.log('🚀 App initialization starting...');
    
    // Create global app namespace
    window.LightChallengeApp = window.LightChallengeApp || {
        initialized: false,
        audioContextStarted: false,
        resizeTimer: null
    };
    
    /**
     * Main initialization function
     */
    function initializeApp() {
        console.log('🎮 Initializing The Spy Academy...');
        
        // Update loading progress
        updateLoadingProgress('Checking compatibility...');
        
        // Set up device-specific optimizations
        setupDeviceOptimizations();
        
        // Wait for all scripts to load
        waitForDependencies()
            .then(function() {
                updateLoadingProgress('Setting up game systems...');
                return setupGameSystems();
            })
            .then(function() {
                updateLoadingProgress('Preparing interface...');
                return setupUI();
            })
            .then(function() {
                updateLoadingProgress('Starting game...');
                return showMainMenu();
            })
            .then(function() {
                window.LightChallengeApp.initialized = true;
                console.log('✅ App initialized successfully');
            })
            .catch(function(error) {
                console.error('❌ Initialization failed:', error);
                showError('Failed to start the game. Please refresh the page.');
            });
    }
    
    /**
     * Update loading screen progress
     */
    function updateLoadingProgress(message) {
        var progressEl = document.getElementById('loading-progress');
        if (progressEl) {
            progressEl.textContent = message;
        }
        console.log('📊', message);
    }
    
    /**
     * Wait for required dependencies
     */
    function waitForDependencies() {
        return new Promise(function(resolve) {
            var maxAttempts = 50;
            var attempts = 0;
            
            function check() {
                attempts++;
                
                // Check for required dependencies
                var hasLogger = typeof window.logger !== 'undefined';
                var hasConfig = typeof window.gameConfig !== 'undefined';
                var hasHelpers = typeof window.gameHelpers !== 'undefined';
                
                if (hasLogger && hasConfig && hasHelpers) {
                    console.log('✅ All core dependencies loaded');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Some dependencies missing, continuing anyway');
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            }
            
            check();
        });
    }
    
    /**
     * Setup game systems
     */
    function setupGameSystems() {
        return new Promise(function(resolve) {
            try {
                // Initialize sound manager if available
                if (typeof SoundManager !== 'undefined' && !window.soundManager) {
                    window.soundManager = new SoundManager();
                    console.log('🔊 Sound manager initialized');
                }
                
                // Initialize voice manager (AudioManager/VoiceManager) if available
                if (typeof VoiceManager !== 'undefined' && !window.audioManager) {
                    window.audioManager = new VoiceManager();
                    console.log('🎤 Voice manager (AI narration) initialized');
                }
                
                // Set up first user interaction handlers for audio
                setupAudioInteraction();
                
                // Initialize 3D scene if THREE.js is available
                if (typeof THREE !== 'undefined' && window.mainMenuScene) {
                    try {
                        window.mainMenuScene.init();
                        console.log('🎨 3D scene initialized');
                    } catch (e) {
                        console.warn('⚠️ 3D scene failed:', e);
                    }
                }
                
                resolve();
            } catch (error) {
                console.error('❌ Game systems setup failed:', error);
                resolve(); // Continue anyway
            }
        });
    }
    
    /**
     * Setup audio interaction handlers
     */
    function setupAudioInteraction() {
        var audioUnlocked = false;
        
        function unlockAudio(e) {
            if (audioUnlocked) return;
            
            console.log('🎵 First user interaction detected:', e.type);
            audioUnlocked = true;
            window.LightChallengeApp.audioContextStarted = true;
            
            // Resume AudioContext if sound manager exists
            if (window.soundManager && typeof window.soundManager.resumeAudioContext === 'function') {
                window.soundManager.resumeAudioContext()
                    .then(function() {
                        console.log('✅ Audio context ready');
                    })
                    .catch(function(err) {
                        console.warn('⚠️ Audio context failed:', err);
                    });
            }
            
            // Unlock voice synthesis for iOS devices
            if (window.audioManager && typeof window.audioManager.unlockAudio === 'function') {
                window.audioManager.unlockAudio()
                    .then(function() {
                        console.log('✅ Voice audio unlocked for iOS');
                    })
                    .catch(function(err) {
                        console.warn('⚠️ Voice unlock failed:', err);
                    });
            }
            
            // Also try global voiceManager
            if (window.gameManager && window.gameManager.voiceManager) {
                var vm = window.gameManager.voiceManager;
                if (typeof vm.unlockAudio === 'function') {
                    vm.unlockAudio().catch(function(err) {
                        console.warn('⚠️ VoiceManager unlock failed:', err);
                    });
                }
            }
        }
        
        // Listen for first interaction - use capture to catch all events
        document.addEventListener('click', unlockAudio, { once: true, capture: true });
        document.addEventListener('touchstart', unlockAudio, { once: true, capture: true, passive: true });
        document.addEventListener('touchend', unlockAudio, { once: true, capture: true, passive: true });
        document.addEventListener('keydown', unlockAudio, { once: true, capture: true });
        
        // Also unlock on any button click
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                if (window.audioManager && typeof window.audioManager.unlockAudio === 'function') {
                    window.audioManager.unlockAudio();
                }
                if (window.gameManager && window.gameManager.voiceManager) {
                    var vm = window.gameManager.voiceManager;
                    if (typeof vm.unlockAudio === 'function') {
                        vm.unlockAudio();
                    }
                }
            }
        }, { capture: true });
    }
    
    /**
     * Setup UI controls and interactions
     */
    function setupUI() {
        return new Promise(function(resolve) {
            try {
                // Set up start button
                var startBtn = document.getElementById('start-game-btn');
                if (startBtn) {
                    startBtn.addEventListener('click', handleStartGame);
                    startBtn.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        handleStartGame();
                    });
                    console.log('✅ Start button configured');
                }
                
                // Set up volume controls
                setupVolumeControls();
                
                // Set up fullscreen toggle
                setupFullscreenToggle();
                
                // Set up skip voting checkbox
                setupSkipVotingCheckbox();
                
                // Set up AI voice API key controls
                setupVoiceSettings();
                
                resolve();
            } catch (error) {
                console.error('❌ UI setup failed:', error);
                resolve(); // Continue anyway
            }
        });
    }
    
    /**
     * Setup voice settings for API key management
     */
    function setupVoiceSettings() {
        var saveBtn = document.getElementById('save-api-key');
        var clearBtn = document.getElementById('clear-api-key');
        var keyInput = document.getElementById('elevenlabs-api-key');
        var statusDiv = document.getElementById('voice-status');
        
        if (!saveBtn || !clearBtn || !keyInput || !statusDiv) {
            console.log('⚠️ Voice settings UI elements not found');
            return;
        }
        
        // Load saved API key
        var savedKey = localStorage.getItem('elevenlabs_api_key');
        if (savedKey) {
            keyInput.value = savedKey;
            updateVoiceStatus('API key loaded - ElevenLabs ready!', 'success');
        }
        
        // Save API key
        saveBtn.addEventListener('click', function() {
            var key = keyInput.value.trim();
            
            if (!key) {
                updateVoiceStatus('Please enter a valid API key', 'error');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('elevenlabs_api_key', key);
            
            // Update voice manager if available
            if (window.audioManager && window.audioManager.setElevenLabsKey) {
                window.audioManager.setElevenLabsKey(key);
            }
            
            updateVoiceStatus('API key saved! Voice will use ElevenLabs (Adam voice)', 'success');
            console.log('✅ ElevenLabs API key saved');
        });
        
        // Clear API key
        clearBtn.addEventListener('click', function() {
            localStorage.removeItem('elevenlabs_api_key');
            keyInput.value = '';
            
            // Update voice manager if available
            if (window.audioManager && window.audioManager.setElevenLabsKey) {
                window.audioManager.setElevenLabsKey(null);
            }
            
            updateVoiceStatus('API key cleared - will use browser default voice', 'info');
            console.log('🗑️ ElevenLabs API key cleared');
        });
        
        function updateVoiceStatus(message, type) {
            statusDiv.textContent = message;
            statusDiv.className = 'voice-status ' + type;
            
            // Auto-clear status after 5 seconds
            setTimeout(function() {
                statusDiv.textContent = '';
                statusDiv.className = 'voice-status';
            }, 5000);
        }
    }
    
    /**
     * Handle start game button click
     */
    function handleStartGame() {
        console.log('🎮 Starting game...');
        
        var startBtn = document.getElementById('start-game-btn');
        if (!startBtn) return;
        
        // Visual feedback
        startBtn.disabled = true;
        startBtn.style.opacity = '0.7';
        startBtn.textContent = 'STARTING...';
        
        // Start audio if available
        if (window.soundManager) {
            if (typeof window.soundManager.playClick === 'function') {
                window.soundManager.playClick();
            }
            
            // Start music after a brief delay
            setTimeout(function() {
                if (typeof window.soundManager.playRandomIntroMusic === 'function') {
                    window.soundManager.playRandomIntroMusic();
                }
            }, 100);
        }
        
        // Transition to player selection
        setTimeout(function() {
            transitionToPlayerSelection();
        }, 500);
    }
    
    /**
     * Transition to player selection screen
     */
    function transitionToPlayerSelection() {
        var mainMenu = document.getElementById('main-menu');
        var playerSelection = document.getElementById('player-selection');
        
        if (!mainMenu || !playerSelection) {
            console.error('❌ Required scenes not found');
            return;
        }
        
        // Hide main menu
        mainMenu.classList.remove('active');
        mainMenu.style.opacity = '0';
        
        setTimeout(function() {
            mainMenu.style.display = 'none';
            playerSelection.style.display = 'block';
            playerSelection.classList.add('active');
            
            // Set up player selection buttons
            setupPlayerSelection();
        }, 600);
    }
    
    /**
     * Setup player selection buttons
     */
    function setupPlayerSelection() {
        var buttons = document.querySelectorAll('.player-btn');
        
        buttons.forEach(function(button) {
            var handler = function() {
                var count = parseInt(button.getAttribute('data-count'));
                if (!count) return;
                
                console.log('👥 Selected', count, 'players');
                
                if (window.soundManager && typeof window.soundManager.playSelect === 'function') {
                    window.soundManager.playSelect();
                }
                
                // Visual feedback
                buttons.forEach(function(btn) { btn.classList.remove('selected'); });
                button.classList.add('selected');
                
                // Transition to color selection
                setTimeout(function() {
                    transitionToColorSelection(count);
                }, 500);
            };
            
            button.addEventListener('click', handler);
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                handler();
            });
        });
    }
    
    /**
     * Transition to color selection
     */
    function transitionToColorSelection(playerCount) {
        var playerSelection = document.getElementById('player-selection');
        var colorSelection = document.getElementById('color-selection');
        
        if (!playerSelection || !colorSelection) {
            console.error('❌ Required scenes not found');
            return;
        }
        
        playerSelection.classList.remove('active');
        playerSelection.style.opacity = '0';
        
        setTimeout(function() {
            playerSelection.style.display = 'none';
            colorSelection.style.display = 'block';
            colorSelection.classList.add('active');
            
            // Set up color selection
            setupColorSelection(playerCount);
        }, 600);
    }
    
    /**
     * Setup color selection interface
     */
    function setupColorSelection(playerCount) {
        var colorGrid = document.getElementById('color-grid');
        var confirmBtn = document.getElementById('confirm-colors');
        
        if (!colorGrid || !confirmBtn) {
            console.error('❌ Color selection elements not found');
            return;
        }
        
        var colors = [
            { color: '#ff0000', name: 'Red' },
            { color: '#00ff00', name: 'Green' },
            { color: '#0080ff', name: 'Blue' },
            { color: '#ffff00', name: 'Yellow' },
            { color: '#ff8000', name: 'Orange' },
            { color: '#8000ff', name: 'Purple' },
            { color: '#ff0080', name: 'Pink' },
            { color: '#00ff80', name: 'Cyan' }
        ];
        
        var selectedColors = [];
        var playerNames = [];
        
        // Build UI
        var html = '';
        for (var i = 0; i < playerCount; i++) {
            html += '<div class="player-color-row">';
            html += '<div class="player-name-section">';
            html += '<input type="text" class="player-name-input" data-player="' + i + '" ';
            html += 'placeholder="Enter Player ' + (i + 1) + ' Name" value="Player ' + (i + 1) + '" maxlength="20">';
            html += '</div>';
            html += '<div class="color-options" data-player="' + i + '">';
            
            colors.forEach(function(c, idx) {
                html += '<div class="color-option" data-color="' + c.color + '" data-name="' + c.name + '" ';
                html += 'data-index="' + idx + '" style="background-color: ' + c.color + ';" title="' + c.name + '"></div>';
            });
            
            html += '</div></div>';
        }
        
        colorGrid.innerHTML = html;
        
        // Set up name inputs
        var nameInputs = colorGrid.querySelectorAll('.player-name-input');
        nameInputs.forEach(function(input) {
            var playerIdx = parseInt(input.getAttribute('data-player'));
            playerNames[playerIdx] = input.value;
            
            input.addEventListener('input', function() {
                playerNames[playerIdx] = input.value.trim() || 'Player ' + (playerIdx + 1);
                checkColorSelectionComplete();
            });
        });
        
        // Set up color selection
        var colorOptions = colorGrid.querySelectorAll('.color-option');
        colorOptions.forEach(function(option) {
            var handler = function() {
                var playerIdx = parseInt(option.closest('.color-options').getAttribute('data-player'));
                var color = option.getAttribute('data-color');
                var colorName = option.getAttribute('data-name');
                
                // Check if color already selected by another player
                var alreadySelected = selectedColors.some(function(sc, idx) {
                    return sc && sc.color === color && idx !== playerIdx;
                });
                
                if (alreadySelected) {
                    if (window.soundManager && typeof window.soundManager.playWarning === 'function') {
                        window.soundManager.playWarning();
                    }
                    return;
                }
                
                // Select color
                selectedColors[playerIdx] = { color: color, name: colorName };
                
                if (window.soundManager && typeof window.soundManager.playSelect === 'function') {
                    window.soundManager.playSelect();
                }
                
                updateColorStates();
                checkColorSelectionComplete();
            };
            
            option.addEventListener('click', handler);
            option.addEventListener('touchend', function(e) {
                e.preventDefault();
                handler();
            });
        });
        
        function updateColorStates() {
            colorOptions.forEach(function(opt) {
                var optColor = opt.getAttribute('data-color');
                var optPlayerIdx = parseInt(opt.closest('.color-options').getAttribute('data-player'));
                
                var isSelectedByThisPlayer = selectedColors[optPlayerIdx] && selectedColors[optPlayerIdx].color === optColor;
                var isSelectedByOther = selectedColors.some(function(sc, idx) {
                    return idx !== optPlayerIdx && sc && sc.color === optColor;
                });
                
                opt.classList.toggle('selected', isSelectedByThisPlayer);
                opt.classList.toggle('disabled', isSelectedByOther);
                
                // Update name input color
                var nameInput = colorGrid.querySelector('.player-name-input[data-player="' + optPlayerIdx + '"]');
                if (nameInput && selectedColors[optPlayerIdx]) {
                    nameInput.style.backgroundColor = selectedColors[optPlayerIdx].color;
                    nameInput.style.color = getContrastColor(selectedColors[optPlayerIdx].color);
                }
            });
        }
        
        function checkColorSelectionComplete() {
            var allSelected = selectedColors.length >= playerCount && 
                selectedColors.slice(0, playerCount).every(function(c) { return c && c.color; });
            
            if (allSelected) {
                confirmBtn.style.display = 'block';
                confirmBtn.disabled = false;
            } else {
                confirmBtn.style.display = 'none';
            }
        }
        
        // Confirm button handler
        var confirmHandler = function() {
            if (confirmBtn.disabled) return;
            confirmBtn.disabled = true;
            
            var playerData = [];
            for (var i = 0; i < playerCount; i++) {
                playerData.push({
                    name: playerNames[i] || 'Player ' + (i + 1),
                    color: selectedColors[i].color,
                    colorName: selectedColors[i].name
                });
            }
            
            console.log('✅ Players configured:', playerData);
            
            if (window.soundManager && typeof window.soundManager.playClick === 'function') {
                window.soundManager.playClick();
            }
            
            // Fade out intro music
            if (window.soundManager && window.soundManager.stopIntroMusic) {
                window.soundManager.stopIntroMusic();
            }
            
            // Hide color selection scene before starting game
            var colorSelection = document.getElementById('color-selection');
            if (colorSelection) {
                colorSelection.classList.remove('active');
                colorSelection.style.opacity = '0';
                
                setTimeout(function() {
                    colorSelection.style.display = 'none';
                    
                    // Now start the game with game manager
                    // This will show the role assignment scene with voice instructions
                    startGameWithPlayers(playerData);
                }, 600);
            } else {
                // If scene not found, start immediately
                startGameWithPlayers(playerData);
            }
        };
        
        confirmBtn.addEventListener('click', confirmHandler);
        confirmBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            confirmHandler();
        });
    }
    
    /**
     * Start game with player data - integrates with full game flow
     */
    function startGameWithPlayers(playerData) {
        console.log('🎮 Starting game with', playerData.length, 'players');
        
        // Wait for game manager to be ready
        var attempts = 0;
        var maxAttempts = 50;
        
        function tryStart() {
            attempts++;
            
            // Check if GameManager class exists
            if (typeof GameManager !== 'undefined') {
                // Initialize game manager if not already done
                if (!window.gameManager) {
                    console.log('📦 Initializing Game Manager...');
                    window.gameManager = new GameManager();
                }
                
                // Initialize all managers (including voice manager)
                if (typeof window.gameManager.initializeManagers === 'function') {
                    window.gameManager.initializeManagers()
                        .then(function() {
                            console.log('✅ Managers initialized');
                            
                            // Start the game with proper role assignment and voice instructions
                            if (typeof window.gameManager.setupGame === 'function') {
                                return window.gameManager.setupGame(playerData.length, playerData);
                            } else {
                                throw new Error('setupGame method not found');
                            }
                        })
                        .then(function() {
                            console.log('✅ Game started successfully with voice instructions');
                        })
                        .catch(function(error) {
                            console.error('❌ Game start failed:', error);
                            showError('Failed to start game. Please refresh the page.');
                        });
                } else {
                    // Fallback: try direct setup
                    console.warn('⚠️ initializeManagers not found, trying direct setup');
                    if (typeof window.gameManager.setupGame === 'function') {
                        window.gameManager.setupGame(playerData.length, playerData)
                            .then(function() {
                                console.log('✅ Game started successfully');
                            })
                            .catch(function(error) {
                                console.error('❌ Game start failed:', error);
                                showError('Failed to start game. Please refresh the page.');
                            });
                    }
                }
            } else if (attempts < maxAttempts) {
                setTimeout(tryStart, 100);
            } else {
                console.error('❌ GameManager not available after', maxAttempts, 'attempts');
                showError('Game system not ready. Please refresh the page.');
            }
        }
        
        tryStart();
    }
    
    /**
     * Get contrast color for text
     */
    function getContrastColor(hexColor) {
        var r = parseInt(hexColor.substr(1, 2), 16);
        var g = parseInt(hexColor.substr(3, 2), 16);
        var b = parseInt(hexColor.substr(5, 2), 16);
        var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    /**
     * Setup volume controls
     */
    function setupVolumeControls() {
        var toggle = document.getElementById('volume-toggle');
        var control = document.getElementById('volume-control');
        var close = document.getElementById('close-volume');
        
        if (toggle && control) {
            toggle.addEventListener('click', function() {
                control.classList.toggle('show');
            });
        }
        
        if (close && control) {
            close.addEventListener('click', function() {
                control.classList.remove('show');
            });
        }
        
        // Set up sliders
        var masterSlider = document.getElementById('master-volume');
        var sfxSlider = document.getElementById('sfx-volume');
        var musicSlider = document.getElementById('music-volume');
        var muteBtn = document.getElementById('mute-btn');
        
        if (masterSlider && window.soundManager) {
            masterSlider.addEventListener('input', function(e) {
                var volume = e.target.value / 100;
                if (window.soundManager.setMasterVolume) {
                    window.soundManager.setMasterVolume(volume);
                }
            });
        }
        
        if (sfxSlider && window.soundManager) {
            sfxSlider.addEventListener('input', function(e) {
                var volume = e.target.value / 100;
                if (window.soundManager.setSFXVolume) {
                    window.soundManager.setSFXVolume(volume);
                }
            });
        }
        
        if (musicSlider && window.soundManager) {
            musicSlider.addEventListener('input', function(e) {
                var volume = e.target.value / 100;
                if (window.soundManager.setMusicVolume) {
                    window.soundManager.setMusicVolume(volume);
                }
            });
        }
        
        if (muteBtn && window.soundManager) {
            muteBtn.addEventListener('click', function() {
                if (window.soundManager.toggleMute) {
                    var isMuted = window.soundManager.toggleMute();
                    muteBtn.textContent = isMuted ? 'Unmute All' : 'Mute All';
                }
            });
        }
    }
    
    /**
     * Setup fullscreen toggle
     */
    function setupFullscreenToggle() {
        var btn = document.getElementById('fullscreen-toggle');
        if (!btn) return;
        
        btn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(function(err) {
                    console.warn('Fullscreen failed:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    /**
     * Setup skip voting checkbox
     */
    function setupSkipVotingCheckbox() {
        var checkbox = document.getElementById('skip-voting-checkbox');
        var container = document.querySelector('.skip-voting-container');
        
        if (!checkbox || !container) return;
        
        // Load saved preference
        var saved = localStorage.getItem('skipVotingScene');
        if (saved === 'true') {
            checkbox.checked = true;
            container.classList.add('enabled');
        }
        
        // Save on change
        checkbox.addEventListener('change', function() {
            container.classList.toggle('enabled', checkbox.checked);
            localStorage.setItem('skipVotingScene', checkbox.checked);
            window.gameSettings = window.gameSettings || {};
            window.gameSettings.skipVotingScene = checkbox.checked;
        });
    }
    
    /**
     * Show main menu
     */
    function showMainMenu() {
        return new Promise(function(resolve) {
            var loading = document.getElementById('loading-screen');
            var mainMenu = document.getElementById('main-menu');
            
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(function() {
                    loading.style.display = 'none';
                }, 500);
            }
            
            if (mainMenu) {
                mainMenu.style.display = 'block';
                setTimeout(function() {
                    mainMenu.classList.add('active');
                    mainMenu.style.opacity = '1';
                    resolve();
                }, 100);
            } else {
                resolve();
            }
        });
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        alert(message);
    }
    
    /**
     * Setup device-specific optimizations
     */
    function setupDeviceOptimizations() {
        // Set up viewport height fix for mobile
        function setViewportHeight() {
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        }
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setViewportHeight, 100);
        });
        
        console.log('📱 Device optimizations configured');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM already loaded
        setTimeout(initializeApp, 100);
    }
    
    console.log('✅ App initialization module loaded');
    
})();
