package com.example.angerstickzombie.data

enum class Faction {
    ORDER, CHAOS, ELEMENTAL
}

enum class UnitClass {
    SWORDWRATH, ARCHER, SPEARMAN, TANKER, ZOMBIE, HERO
}

enum class SkinType {
    NONE, VAMPIRIC, LEAF, ICE, LAVA
}

data class SkinEffect(
    val type: SkinType,
    val lifesteal: Float = 0f,
    val costMultiplier: Float = 1f,
    val moveSpeedMultiplier: Float = 1f,
    val slowOnHit: Float = 0f,
    val reflect: Float = 0f,
    val burnDps: Float = 0f
)

object Skins {
    fun effect(type: SkinType): SkinEffect = when (type) {
        SkinType.VAMPIRIC -> SkinEffect(type, lifesteal = 0.12f)
        SkinType.LEAF -> SkinEffect(type, costMultiplier = 0.85f, moveSpeedMultiplier = 1.12f)
        SkinType.ICE -> SkinEffect(type, slowOnHit = 0.18f)
        SkinType.LAVA -> SkinEffect(type, reflect = 0.10f, burnDps = 6f)
        else -> SkinEffect(SkinType.NONE)
    }
}
