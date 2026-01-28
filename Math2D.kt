package com.example.angerstickzombie.engine

import kotlin.math.*

data class Vec2(var x: Float = 0f, var y: Float = 0f) {
    fun set(nx: Float, ny: Float) { x = nx; y = ny }
    fun add(dx: Float, dy: Float) { x += dx; y += dy }
    fun len(): Float = sqrt(x * x + y * y)
    fun nor() {
        val l = len()
        if (l > 1e-5f) { x /= l; y /= l }
    }
    fun copy(): Vec2 = Vec2(x, y)
}

fun clamp(v: Float, lo: Float, hi: Float): Float = max(lo, min(hi, v))
