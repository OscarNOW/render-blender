import bpy
import wave
import array


def create_silent_wav(file_path, framerate, num_frames):
    channels = 1  # Mono audio
    sampWidth = 2  # 2 bytes per sample (16-bit)
    nFrames = num_frames
    compType = 'NONE'
    compName = 'not compressed'

    # Initialize the WAV writer
    with wave.open(file_path, 'w') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sampWidth)
        wav_file.setframerate(framerate)
        wav_file.setnframes(nFrames)
        wav_file.setcomptype(compType, compName)

        silent_samples = array.array('h', [0] * num_frames)
        wav_file.writeframes(silent_samples.tobytes())


def exportEmptyAudio():
    create_silent_wav(
        output_audio_path, bpy.context.scene.render.fps, bpy.context.scene.frame_end)


output_audio_path = "_outputFilePath_"

# todo: get current scene
scene = bpy.data.scenes[0]

if scene.sequence_editor and len(scene.sequence_editor.sequences) > 0:
    audio_strip = scene.sequence_editor.sequences[0]
    if audio_strip.type == 'SOUND':
        bpy.ops.sound.mixdown(filepath=output_audio_path,
                              container='WAV', codec='PCM')
        print("Audio exported successfully.")
    else:
        print("No audio strip found in the sequencer.")
        exportEmptyAudio()
else:
    print("Sequencer not found in the scene.")
    exportEmptyAudio()
