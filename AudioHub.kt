package com.example.angerstickzombie.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import com.example.angerstickzombie.R
import com.example.angerstickzombie.util.Prefs
import kotlin.math.max
import kotlin.math.min

/**
 * AudioHub: one place to control game audio.
 * - 2 music channels (menu & battle)
 * - SFX SoundPool
 * - "ducking" when Ultimate happens (pro feel)
 */
class AudioHub(private val ctx: Context) {

    private var menuPlayer: MediaPlayer? = null
    private var battlePlayer: MediaPlayer? = null

    private var soundPool: SoundPool? = null
    private var sfxPunchId: Int = 0
    private var loaded = false

    private var duckingActive = false

    fun init() {
        val attrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(10)
            .setAudioAttributes(attrs)
            .build()

        sfxPunchId = soundPool!!.load(ctx, R.raw.sfx_punch, 1)
        soundPool!!.setOnLoadCompleteListener { _, _, status ->
            loaded = (status == 0)
        }
    }

    fun playMenu(loop: Boolean = true) {
        stopBattle()
        if (menuPlayer == null) {
            menuPlayer = MediaPlayer.create(ctx, R.raw.bgm_menu).apply { isLooping = loop }
        }
        menuPlayer?.setVolume(Prefs.musicVol(ctx), Prefs.musicVol(ctx))
        if (menuPlayer?.isPlaying != true) menuPlayer?.start()
    }

    fun playBattle(loop: Boolean = true) {
        stopMenu()
        if (battlePlayer == null) {
            battlePlayer = MediaPlayer.create(ctx, R.raw.bgm_battle).apply { isLooping = loop }
        }
        val vol = currentMusicVol()
        battlePlayer?.setVolume(vol, vol)
        if (battlePlayer?.isPlaying != true) battlePlayer?.start()
    }

    fun stopMenu() {
        menuPlayer?.pause()
    }

    fun stopBattle() {
        battlePlayer?.pause()
    }

    fun onResume() {
        // keep whichever is active; callers decide
    }

    fun onPause() {
        menuPlayer?.pause()
        battlePlayer?.pause()
    }

    fun release() {
        menuPlayer?.release()
        battlePlayer?.release()
        menuPlayer = null
        battlePlayer = null
        soundPool?.release()
        soundPool = null
    }

    fun punch() {
        if (!loaded) return
        val v = Prefs.sfxVol(ctx)
        soundPool?.play(sfxPunchId, v, v, 1, 0, 1f)
    }

    /**
     * Call when Ultimate triggers:
     * - duck music quickly
     * - restore after duration
     */
    fun ultimateDucking(durationMs: Long = 550L) {
        if (!Prefs.ducking(ctx)) return
        if (duckingActive) return
        duckingActive = true

        val target = max(0.18f, Prefs.musicVol(ctx) * 0.35f)
        setMusicVolInternal(target)

        // simple delayed restore using a thread (no coroutines to keep deps minimal)
        Thread {
            try { Thread.sleep(durationMs) } catch (_: Exception) {}
            val restore = Prefs.musicVol(ctx)
            setMusicVolInternal(restore)
            duckingActive = false
        }.start()
    }

    fun refreshVolumes() {
        val v = currentMusicVol()
        menuPlayer?.setVolume(v, v)
        battlePlayer?.setVolume(v, v)
    }

    private fun currentMusicVol(): Float {
        // if ducking is active, keep lower volume
        if (duckingActive) return max(0.18f, Prefs.musicVol(ctx) * 0.35f)
        return Prefs.musicVol(ctx)
    }

    private fun setMusicVolInternal(v: Float) {
        menuPlayer?.setVolume(v, v)
        battlePlayer?.setVolume(v, v)
    }
}
