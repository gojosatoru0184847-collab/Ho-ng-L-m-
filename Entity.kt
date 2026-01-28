package com.example.angerstickzombie.engine

import android.graphics.Canvas
import android.graphics.Paint
import com.example.angerstickzombie.data.Faction
import com.example.angerstickzombie.data.SkinEffect
import com.example.angerstickzombie.data.SkinType
import com.example.angerstickzombie.data.Skins
import com.example.angerstickzombie.data.UnitClass
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

abstract class Entity(
    var pos: Vec2,
    var radius: Float,
) {
    var alive: Boolean = true
    abstract fun update(world: World, dt: Float)
    abstract fun draw(canvas: Canvas, paint: Paint)
}

/**
 * Base combat unit.
 */
open class Unit(
    pos: Vec2,
    radius: Float,
    val faction: Faction,
    val unitClass: UnitClass,
    var maxHp: Float,
    var dmg: Float,
    var moveSpeed: Float,
    var attackRange: Float,
    var atkCooldown: Float,
    var skinType: SkinType = SkinType.NONE
) : Entity(pos, radius) {

    var hp: Float = maxHp
    private var cd: Float = 0f

    val skin: SkinEffect get() = Skins.effect(skinType)

    // simple status
    private var slowTimer = 0f
    private var slowFactor = 1f
    private var burnTimer = 0f

    override fun update(world: World, dt: Float) {
        if (!alive) return

        // burn
        if (skin.burnDps > 0f && burnTimer > 0f) {
            hp -= skin.burnDps * dt
            burnTimer -= dt
        }

        // slow decay
        if (slowTimer > 0f) {
            slowTimer -= dt
            if (slowTimer <= 0f) slowFactor = 1f
        }

        cd = max(0f, cd - dt)

        val target = world.findNearestEnemy(this)
        if (target != null) {
            val dx = target.pos.x - pos.x
            val dy = target.pos.y - pos.y
            val dist = kotlin.math.sqrt(dx*dx + dy*dy)

            if (dist <= attackRange) {
                if (cd <= 0f) {
                    cd = atkCooldown
                    attack(world, target)
                }
            } else {
                // move toward
                val v = Vec2(dx, dy)
                v.nor()
                val speed = moveSpeed * skin.moveSpeedMultiplier * slowFactor
                pos.add(v.x * speed * dt, v.y * speed * dt)
            }
        }

        if (hp <= 0f) alive = false
    }

    open fun attack(world: World, enemy: Unit) {
        // instant hit (demo)
        enemy.takeDamage(world, this, dmg)

        // on-hit effects
        if (skin.slowOnHit > 0f) enemy.applySlow(0.65f, 0.7f) // 0.7s slow
        if (skin.burnDps > 0f) enemy.applyBurn(1.2f) // 1.2s burn
    }

    fun takeDamage(world: World, from: Unit, amount: Float) {
        hp -= amount

        // reflect (lava)
        if (skin.reflect > 0f) {
            val r = amount * skin.reflect
            from.hp -= r
        }

        // lifesteal (vampiric) - attacker heals
        val ls = from.skin.lifesteal
        if (ls > 0f) {
            from.hp = min(from.maxHp, from.hp + amount * ls)
        }

        if (hp <= 0f) {
            alive = false
            world.onUnitKilled(from, this)
        }
    }

    fun applySlow(factor: Float, seconds: Float) {
        slowFactor = min(slowFactor, factor)
        slowTimer = max(slowTimer, seconds)
    }

    fun applyBurn(seconds: Float) {
        burnTimer = max(burnTimer, seconds)
    }

    override fun draw(canvas: Canvas, paint: Paint) {
        // simple stick-ish dots
        paint.style = Paint.Style.FILL
        canvas.drawCircle(pos.x, pos.y, radius, paint)

        // hp bar
        val w = radius * 2.2f
        val h = 6f
        val x0 = pos.x - w/2
        val y0 = pos.y - radius - 14f
        paint.style = Paint.Style.FILL
        paint.alpha = 160
        canvas.drawRect(x0, y0, x0 + w, y0 + h, paint)
        paint.alpha = 255

        val ratio = (hp / maxHp).coerceIn(0f, 1f)
        canvas.drawRect(x0, y0, x0 + w * ratio, y0 + h, paint)
    }
}

class Hero(
    pos: Vec2,
    faction: Faction,
    skinType: SkinType = SkinType.NONE
) : Unit(
    pos = pos,
    radius = 18f,
    faction = faction,
    unitClass = UnitClass.HERO,
    maxHp = 260f,
    dmg = 22f,
    moveSpeed = 160f,
    attackRange = 46f,
    atkCooldown = 0.28f,
    skinType = skinType
) {
    private var ultCd = 0f

    override fun update(world: World, dt: Float) {
        super.update(world, dt)
        ultCd = max(0f, ultCd - dt)
    }

    fun tryUltimate(world: World) {
        if (ultCd > 0f) return
        ultCd = 6.5f

        // AOE shockwave
        val enemies = world.units.filter { it.alive && it.faction != faction }
        for (e in enemies) {
            val dx = e.pos.x - pos.x
            val dy = e.pos.y - pos.y
            val dist = kotlin.math.sqrt(dx*dx + dy*dy)
            if (dist < 160f) {
                e.takeDamage(world, this, 45f)
                e.applySlow(0.55f, 1.0f)
            }
        }

        world.spawnParticleBurst(pos.x, pos.y)
        world.onUltimateTriggered()
    }
}
