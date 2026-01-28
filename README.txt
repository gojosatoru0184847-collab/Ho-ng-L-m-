AngerStickZombiePro (Android / Kotlin) - Expanded template
=========================================================
What you get (bigger codebase):
- MenuActivity (background image + menu music + buttons)
- SettingsActivity (music/sfx sliders + ultimate ducking toggle)
- GameActivity + GameView (SurfaceView game loop)
- World/Entity/Unit/Hero with simple combat, particles, wave spawning
- Factions, Skins, Card system skeleton (for future expansion)
- AudioHub (menu/battle music, SoundPool sfx, ducking effect)

How to run:
1) Open project folder in Android Studio.
2) Replace res/drawable/bg_menu.png with your art.
3) Replace res/raw/bgm_menu.mp3 (ambient) if you want; current is same as battle.
4) Build APK: Build > Build Bundle(s) / APK(s) > Build APK(s)

Controls (demo):
- Tap anywhere: spawn a Swordwrath unit (cost gold)
- Drag finger: move Hero
- Tap bottom-right corner: Hero Ultimate (AOE + slow) with music ducking

This is a starter "real game loop" foundation; you can now add:
- real sprites/animations
- multiple unit types from cards
- PvP netcode (separate topic)
