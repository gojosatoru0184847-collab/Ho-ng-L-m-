package com.example.angerstickzombie.data

/**
 * A simple card system skeleton:
 * - unlock units
 * - upgrade unit stats by level
 */
data class UnitCard(
    val id: String,
    val unitClass: UnitClass,
    var level: Int = 1,
    var unlocked: Boolean = false
) {
    fun upgradeCost(): Int = 50 * level
    fun maxLevel(): Int = 12
    fun canUpgrade(): Boolean = unlocked && level < maxLevel()
}

class CardCollection {
    private val cards = linkedMapOf<String, UnitCard>()

    fun add(card: UnitCard) { cards[card.id] = card }
    fun get(id: String): UnitCard? = cards[id]
    fun all(): List<UnitCard> = cards.values.toList()

    fun seedDefaults() {
        add(UnitCard("card_swordwrath", UnitClass.SWORDWRATH, unlocked = true))
        add(UnitCard("card_archer", UnitClass.ARCHER, unlocked = true))
        add(UnitCard("card_spearman", UnitClass.SPEARMAN, unlocked = false))
        add(UnitCard("card_tanker", UnitClass.TANKER, unlocked = false))
        add(UnitCard("card_hero", UnitClass.HERO, unlocked = true))
    }
}
