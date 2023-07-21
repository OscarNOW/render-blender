import bpy

# todo-imp: specify output path
output_audio_path = "/path/to/output/audio.wav"

# todo: get current scene
scene = bpy.data.scenes[0]

if scene.sequence_editor:
    audio_strip = scene.sequence_editor.sequences[0]
    if audio_strip.type == 'SOUND':
        bpy.ops.sound.mixdown(filepath=output_audio_path,
                              container='WAV', codec='PCM')
        print("Audio exported successfully.")
    else:
        print("No audio strip found in the sequencer.")
else:
    print("Sequencer not found in the scene.")
