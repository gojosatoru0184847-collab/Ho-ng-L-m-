package com.example.angerstickzombie.engine

class Time {
    var dt: Float = 0f
        private set
    private var last = System.nanoTime()

    fun step() {
        val now = System.nanoTime()
        dt = ((now - last) / 1_000_000_000.0).toFloat().coerceIn(0f, 0.05f)
        last = now
    }
}
