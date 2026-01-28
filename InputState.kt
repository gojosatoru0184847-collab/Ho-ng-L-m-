package com.example.angerstickzombie.engine

/**
 * Touch input state for one-finger gameplay:
 * - tap to spawn unit (demo)
 * - drag to move hero (demo)
 */
class InputState {
    var isDown: Boolean = false
    var downX: Float = 0f
    var downY: Float = 0f
    var x: Float = 0f
    var y: Float = 0f
    var tap: Boolean = false

    fun onDown(px: Float, py: Float) {
        isDown = true
        downX = px
        downY = py
        x = px
        y = py
        tap = true
    }

    fun onMove(px: Float, py: Float) {
        x = px
        y = py
        tap = false
    }

    fun onUp(px: Float, py: Float) {
        x = px
        y = py
        isDown = false
    }

    fun consumeTap(): Boolean {
        val t = tap
        tap = false
        return t
    }
}
