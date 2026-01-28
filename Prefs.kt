package com.example.angerstickzombie.util

import android.content.Context
import kotlin.math.max
import kotlin.math.min

object Prefs {
    private const val FILE = "aosz_prefs"
    private const val KEY_MUSIC = "music_vol"
    private const val KEY_SFX = "sfx_vol"
    private const val KEY_DUCK = "ducking"

    fun musicVol(ctx: Context): Float =
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).getFloat(KEY_MUSIC, 0.65f).coerceIn(0f, 1f)

    fun sfxVol(ctx: Context): Float =
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).getFloat(KEY_SFX, 0.9f).coerceIn(0f, 1f)

    fun ducking(ctx: Context): Boolean =
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).getBoolean(KEY_DUCK, true)

    fun setMusicVol(ctx: Context, v: Float) {
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putFloat(KEY_MUSIC, v.coerceIn(0f, 1f)).apply()
    }

    fun setSfxVol(ctx: Context, v: Float) {
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putFloat(KEY_SFX, v.coerceIn(0f, 1f)).apply()
    }

    fun setDucking(ctx: Context, v: Boolean) {
        ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putBoolean(KEY_DUCK, v).apply()
    }
}
