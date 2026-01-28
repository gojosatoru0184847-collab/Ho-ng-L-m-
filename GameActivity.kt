package com.example.angerstickzombie.ui

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.angerstickzombie.R
import com.example.angerstickzombie.audio.AudioHub
import com.example.angerstickzombie.engine.GameView

class GameActivity : AppCompatActivity() {

    private lateinit var audio: AudioHub

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        audio = AudioHub(this)
        audio.init()
        audio.playBattle(loop = true)

        val txtGold = findViewById<TextView>(R.id.txtGold)
        val txtMana = findViewById<TextView>(R.id.txtMana)
        val txtWave = findViewById<TextView>(R.id.txtWave)

        val gv = findViewById<GameView>(R.id.gameView)
        gv.bindHudCallbacks(object : GameView.HudCallbacks {
            override fun onGoldChanged(g: Int) { runOnUiThread { txtGold.text = "Gold: $g" } }
            override fun onManaChanged(m: Int) { runOnUiThread { txtMana.text = "  Mana: $m" } }
            override fun onWaveChanged(w: Int) { runOnUiThread { txtWave.text = "  Wave: $w" } }
            override fun requestPunchSfx() { audio.punch() }
            override fun requestUltimateDucking() { audio.ultimateDucking() }
        })
    }

    override fun onResume() {
        super.onResume()
        audio.playBattle(loop = true)
        audio.refreshVolumes()
    }

    override fun onPause() {
        super.onPause()
        audio.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        audio.release()
    }
}
