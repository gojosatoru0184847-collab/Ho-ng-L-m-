package com.example.angerstickzombie.engine

import android.graphics.Canvas
import android.graphics.Paint
import com.example.angerstickzombie.data.Faction
import com.example.angerstickzombie.data.SkinType
import com.example.angerstickzombie.data.UnitClass
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

class World(
    val width: Int,
    val height: Int,
    private val callbacks: Callbacks
) {
    interface Callbacks {
        fun onGoldChanged(g: Int)
        fun onManaChanged(m: Int)
        fun onWaveChanged(w: Int)
        fun requestPunchSfx()
        fun requestUltimateDucking()
    }

    val units = mutableListOf<Unit>()
    private val particles = mutableListOf<Particle>()

    var gold: Int = 100
        private set
    var mana: Int = 25
        private set
    var wave: Int = 1
        private set

    private var spawnTimer = 0f
    private var incomeTimer = 0f

    val hero: Hero = Hero(Vec2(width * 0.18f, height * 0.70f), Faction.ORDER, skinType = SkinType.NONE)

    init {
        units.add(hero)
        // initial enemies
        repeat(3) { spawnZombie() }
        notifyAllHud()
    }

    fun update(dt: Float, input: InputState) {
        // Income: simple gold/mana tick
        incomeTimer += dt
        if (incomeTimer >= 1.0f) {
            incomeTimer -= 1.0f
            gold += 3
            mana += 1
            callbacks.onGoldChanged(gold)
            callbacks.onManaChanged(mana)
        }

        // Spawn zombie waves
        spawnTimer += dt
        if (spawnTimer >= max(0.55f, 2.2f - wave * 0.08f)) {
            spawnTimer = 0f
            spawnZombie()
            if (Random.nextFloat() < 0.25f) spawnZombie()
        }

        // Tap-to-spawn (demo). Spawn near hero.
        if (input.consumeTap()) {
            trySpawnPlayerUnit(input.x, input.y)
        }

        // Drag hero (demo)
        if (input.isDown) {
            val dx = input.x - hero.pos.x
            val dy = input.y - hero.pos.y
            val v = Vec2(dx, dy)
            if (v.len() > 18f) {
                v.nor()
                hero.pos.add(v.x * 200f * dt, v.y * 200f * dt)
                hero.pos.x = clamp(hero.pos.x, 0f, width.toFloat())
                hero.pos.y = clamp(hero.pos.y, 0f, height.toFloat())
            }
        }

        // Update units
        for (u in units) {
            if (u.alive) u.update(this, dt)
        }
        units.removeAll { !it.alive }

        // Update particles
        for (p in particles) p.update(dt)
        particles.removeAll { !it.alive }

        // win/lose progression
        if (units.none { it.alive && it.faction == Faction.CHAOS }) {
            // keep some chaos by always having zombies; do wave increase by kill count
        }
    }

    fun draw(canvas: Canvas, paint: Paint) {
        // background: flat (you can replace with bitmap draw inside GameView)
        paint.style = Paint.Style.FILL
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // draw units by side
        for (u in units) {
            paint.reset()
            paint.isAntiAlias = true
            // different colors by faction (default colors, do not hardcode fancy palettes)
            u.draw(canvas, paint)
        }

        for (p in particles) {
            paint.reset()
            paint.isAntiAlias = true
            p.draw(canvas, paint)
        }
    }

    fun findNearestEnemy(me: Unit): Unit? {
        var best: Unit? = null
        var bestD = Float.MAX_VALUE
        for (u in units) {
            if (!u.alive) continue
            if (u === me) continue
            if (u.faction == me.faction) continue
            val dx = u.pos.x - me.pos.x
            val dy = u.pos.y - me.pos.y
            val d = dx*dx + dy*dy
            if (d < bestD) { bestD = d; best = u }
        }
        return best
    }

    private fun trySpawnPlayerUnit(x: Float, y: Float) {
        // cost rules (demo)
        val costGold = 25
        if (gold < costGold) return
        gold -= costGold
        callbacks.onGoldChanged(gold)

        // spawn sword unit
        val u = Unit(
            pos = Vec2(x, y),
            radius = 12f,
            faction = Faction.ORDER,
            unitClass = UnitClass.SWORDWRATH,
            maxHp = 95f,
            dmg = 12f,
            moveSpeed = 120f,
            attackRange = 36f,
            atkCooldown = 0.42f,
            skinType = SkinType.LEAF
        )
        units.add(u)
        callbacks.requestPunchSfx()
    }

    private fun spawnZombie() {
        val u = Unit(
            pos = Vec2(width * 0.92f + Random.nextFloat() * 30f, height * (0.18f + Random.nextFloat() * 0.64f)),
            radius = 12f,
            faction = Faction.CHAOS,
            unitClass = UnitClass.ZOMBIE,
            maxHp = 72f + wave * 4f,
            dmg = 9f + wave * 0.6f,
            moveSpeed = 95f + wave * 1.5f,
            attackRange = 34f,
            atkCooldown = 0.5f,
            skinType = SkinType.NONE
        )
        units.add(u)
    }

    fun onUnitKilled(killer: Unit, victim: Unit) {
        // rewards
        if (killer.faction == Faction.ORDER) {
            gold += 6
            mana += 1
            callbacks.onGoldChanged(gold)
            callbacks.onManaChanged(mana)
        }

        // increase wave based on kills
        if (victim.unitClass == UnitClass.ZOMBIE) {
            val chance = min(0.22f, 0.06f + wave * 0.004f)
            if (Random.nextFloat() < chance) {
                wave += 1
                callbacks.onWaveChanged(wave)
            }
        }
    }

    fun spawnParticleBurst(x: Float, y: Float) {
        repeat(18) {
            particles.add(Particle(Vec2(x, y)))
        }
    }

    fun onUltimateTriggered() {
        callbacks.requestUltimateDucking()
    }

    private fun notifyAllHud() {
        callbacks.onGoldChanged(gold)
        callbacks.onManaChanged(mana)
        callbacks.onWaveChanged(wave)
    }
}

private class Particle(pos: Vec2) : Entity(pos, radius = 2.5f) {
    private var vx = (kotlin.random.Random.nextFloat() - 0.5f) * 380f
    private var vy = (kotlin.random.Random.nextFloat() - 0.5f) * 380f
    private var life = 0.55f + kotlin.random.Random.nextFloat() * 0.25f
    override fun update(world: World, dt: Float) {
        life -= dt
        pos.add(vx * dt, vy * dt)
        vx *= 0.92f
        vy *= 0.92f
        if (life <= 0f) alive = false
    }
    override fun draw(canvas: Canvas, paint: Paint) {
        paint.style = Paint.Style.FILL
        paint.alpha = (life / 0.8f * 255).toInt().coerceIn(0, 255)
        canvas.drawCircle(pos.x, pos.y, radius, paint)
        paint.alpha = 255
    }
}
