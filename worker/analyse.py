import bpy

framerate = bpy.context.scene.render.fps
lastFrame = bpy.context.scene.frame_end

with open('_outputPath_lastFrame.txt', 'w') as file:
    file.write(lastFrame)

with open('_outputPath_framerate.txt', 'w') as file:
    file.write(framerate)
