package com.example.angerstickzombie.ui

import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatActivity
import com.example.angerstickzombie.R
import com.example.angerstickzombie.util.Prefs

class SettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val seekMusic = findViewById<SeekBar>(R.id.seekMusic)
        val seekSfx = findViewById<SeekBar>(R.id.seekSfx)
        val chk = findViewById<CheckBox>(R.id.chkDucking)

        seekMusic.max = 100
        seekSfx.max = 100

        seekMusic.progress = (Prefs.musicVol(this) * 100).toInt()
        seekSfx.progress = (Prefs.sfxVol(this) * 100).toInt()
        chk.isChecked = Prefs.ducking(this)

        seekMusic.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                Prefs.setMusicVol(this@SettingsActivity, progress / 100f)
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        seekSfx.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                Prefs.setSfxVol(this@SettingsActivity, progress / 100f)
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        chk.setOnCheckedChangeListener { _, isChecked ->
            Prefs.setDucking(this, isChecked)
        }

        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
    }
}
