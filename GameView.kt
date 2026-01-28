package com.example.angerstickzombie.engine

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.example.angerstickzombie.R
import kotlin.math.max

/**
 * Lightweight game loop using SurfaceView.
 * - 60 FPS target (best effort)
 * - touch input
 */
class GameView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : SurfaceView(context, attrs), SurfaceHolder.Callback {

    interface HudCallbacks {
        fun onGoldChanged(g: Int)
        fun onManaChanged(m: Int)
        fun onWaveChanged(w: Int)
        fun requestPunchSfx()
        fun requestUltimateDucking()
    }

    private val holderRef: SurfaceHolder = holder
    private var thread: GameThread? = null

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val time = Time()
    private val input = InputState()

    private var world: World? = null
    private var hud: HudCallbacks? = null

    // background bitmap (optional)
    private val bgBitmap = BitmapFactory.decodeResource(resources, R.drawable.bg_menu)

    init {
        holderRef.addCallback(this)
        isFocusable = true
    }

    fun bindHudCallbacks(cb: HudCallbacks) { hud = cb }

    override fun surfaceCreated(holder: SurfaceHolder) {
        if (thread != null) return

        val w = width.coerceAtLeast(1)
        val h = height.coerceAtLeast(1)

        world = World(w, h, object : World.Callbacks {
            override fun onGoldChanged(g: Int) { hud?.onGoldChanged(g) }
            override fun onManaChanged(m: Int) { hud?.onManaChanged(m) }
            override fun onWaveChanged(w: Int) { hud?.onWaveChanged(w) }
            override fun requestPunchSfx() { hud?.requestPunchSfx() }
            override fun requestUltimateDucking() { hud?.requestUltimateDucking() }
        })

        thread = GameThread(holderRef, this).also { it.running = true; it.start() }
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        thread?.running = false
        try { thread?.join(700) } catch (_: Exception) {}
        thread = null
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> input.onDown(event.x, event.y)
            MotionEvent.ACTION_MOVE -> input.onMove(event.x, event.y)
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                input.onUp(event.x, event.y)
                // double-tap zone to ultimate (demo): tap near bottom-right
                if (event.x > width * 0.72f && event.y > height * 0.72f) {
                    world?.hero?.tryUltimate(world!!)
                }
            }
        }
        return true
    }

    fun tickAndRender(canvas: Canvas) {
        time.step()
        val dt = time.dt

        // update
        world?.update(dt, input)

        // draw background
        canvas.drawColor(Color.BLACK)
        // draw bitmap stretched (cheap)
        canvas.drawBitmap(bgBitmap, null, android.graphics.Rect(0,0,width,height), null)

        // overlay a little to make units visible
        paint.reset()
        paint.isAntiAlias = true
        paint.color = Color.argb(120, 0, 0, 0)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // draw world
        paint.reset()
        paint.isAntiAlias = true
        paint.color = Color.WHITE
        world?.draw(canvas, paint)

        // draw simple hint
        paint.reset()
        paint.isAntiAlias = true
        paint.color = Color.WHITE
        paint.textSize = 30f
        canvas.drawText("Tap: spawn unit | Drag: move hero | Tap BR: ULT", 18f, height - 26f, paint)
    }

    private class GameThread(
        private val holder: SurfaceHolder,
        private val view: GameView
    ) : Thread() {
        @Volatile var running: Boolean = false
        override fun run() {
            var last = System.nanoTime()
            while (running) {
                val now = System.nanoTime()
                val frameMs = (now - last) / 1_000_000
                last = now

                var canvas: Canvas? = null
                try {
                    canvas = holder.lockCanvas()
                    if (canvas != null) view.tickAndRender(canvas)
                } catch (_: Exception) {
                } finally {
                    if (canvas != null) holder.unlockCanvasAndPost(canvas)
                }

                // crude frame cap to reduce heat
                val sleep = max(0L, 16L - frameMs)
                if (sleep > 0) try { sleep(sleep) } catch (_: Exception) {}
            }
        }
    }
}
