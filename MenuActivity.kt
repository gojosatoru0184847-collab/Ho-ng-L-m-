package com.example.angerstickzombie.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.example.angerstickzombie.R
import com.example.angerstickzombie.audio.AudioHub

class MenuActivity : AppCompatActivity() {

    private lateinit var audio: AudioHub

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu)

        audio = AudioHub(this)
        audio.init()
        audio.playMenu(loop = true)

        findViewById<Button>(R.id.btnPlay).setOnClickListener {
            audio.punch()
            startActivity(Intent(this, GameActivity::class.java))
        }

        findViewById<Button>(R.id.btnSettings).setOnClickListener {
            audio.punch()
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        findViewById<Button>(R.id.btnPunch).setOnClickListener {
            audio.punch()
        }
    }

    override fun onResume() {
        super.onResume()
        audio.playMenu(loop = true)
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
