import os
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from gtts import gTTS
import wave
from moviepy import VideoClip, AudioFileClip, concatenate_videoclips, CompositeAudioClip

# -------------------------------------------------------------
# Configuration and Constants
# -------------------------------------------------------------
FPS = 8  # Good balance between smoothness and render speed
SCREENSHOTS_DIR = "/home/abhishekraj10001/.gemini/antigravity-ide/brain/e0e94771-ec63-4a1c-abe4-90576df407ee"
OUTPUT_DIR = "/home/abhishekraj10001/.gemini/antigravity-ide/brain/e0e94771-ec63-4a1c-abe4-90576df407ee"
MARKETING_DIR = "/home/abhishekraj10001/ai/marketing"

# Setup framed screenshots output folder
FRAMED_OUT_DIR = os.path.join(OUTPUT_DIR, "screenshots")
os.makedirs(FRAMED_OUT_DIR, exist_ok=True)

# Subtitle configuration
SUBTITLE_BOX_Y = 880
SUBTITLE_BOX_H = 120
SUBTITLE_BOX_W = 1400
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Narrative sections script
SECTIONS = [
    {
        "id": "landing",
        "screenshot_glob": "landing_page_*.png",
        "text": "Welcome to NationTwin A.I., the living digital twin of Mumbai. Designed for advanced municipal monitoring, it integrates twelve autonomous agent blocks to synchronize critical infrastructure, weather, health, and transport networks.",
        "border_color": (16, 185, 129),  # Emerald green
    },
    {
        "id": "dashboard",
        "screenshot_glob": "dashboard_overview_*.png",
        "text": "The Operator Console provides a comprehensive look at the city's heartbeat. Here, operators can track real-time telemetry, monitor active crisis warnings, and audit the state of hospitals, traffic, and energy grids instantly.",
        "border_color": (139, 92, 246),  # Violet
    },
    {
        "id": "world_model",
        "screenshot_glob": "world_model_*.png",
        "text": "At the heart of the system is the World Model. This directed dependency graph maps relationships across sectors, showing how monsoons impact reservoir levels, traffic diverted from hospital routes, and grid loads supplying medical wards.",
        "border_color": (6, 182, 212),  # Cyan
    },
    {
        "id": "simulation",
        "screenshot_glob": "simulation_*.png",
        "text": "Planners can simulate extreme stress scenarios like monsoon rain surges, power plant shutdowns, or road closures, allowing the engine to chart recovery curves, projected financial costs, and population impact.",
        "border_color": (245, 158, 11),  # Amber
    },
    {
        "id": "predictions",
        "screenshot_glob": "predictions_*.png",
        "text": "The Predictive Intelligence panel runs advanced threat projections hours in advance, calculating flood risks, traffic bottlenecks, and energy grids approaching critical capacity before they cascade.",
        "border_color": (239, 68, 68),  # Rose
    },
    {
        "id": "map",
        "screenshot_glob": "map_*.png",
        "text": "The Digital Twin Map layers geographical I.S. data, showing glowing sensor beacons, active highway traffic status, pollution density levels, and dynamic heatmaps of cascading municipal risks.",
        "border_color": (99, 102, 241),  # Indigo
    },
    {
        "id": "agents",
        "screenshot_glob": "agents_*.png",
        "text": "Behind the scenes, independent agent blocks run continuous consensus cycles to keep the twin up to date. Empower your city with automated decision intelligence. Experience NationTwin A.I. today.",
        "border_color": (16, 185, 129),  # Emerald green
    }
]

# -------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------

def log(msg):
    print(f"[MARKETING BUILD] {msg}", flush=True)

def find_screenshot(pattern):
    paths = glob.glob(os.path.join(SCREENSHOTS_DIR, pattern))
    if not paths:
        raise FileNotFoundError(f"Could not find screenshot matching pattern: {pattern} in {SCREENSHOTS_DIR}")
    return paths[0]

def draw_gradient_background():
    """Generates a beautiful deep-slate-to-dark-indigo linear gradient canvas."""
    bg = Image.new("RGB", (1920, 1080))
    draw = ImageDraw.Draw(bg)
    for y in range(1080):
        # Blend from #080a10 (top) to #141029 (middle) to #030409 (bottom)
        if y < 540:
            f = y / 540.0
            r = int(8 + (20 - 8) * f)
            g = int(10 + (16 - 10) * f)
            b = int(16 + (41 - 16) * f)
        else:
            f = (y - 540) / 540.0
            r = int(20 + (3 - 20) * f)
            g = int(16 + (4 - 16) * f)
            b = int(41 + (9 - 41) * f)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    return bg

def add_rounded_corners(im, radius):
    """Crops an image with rounded corners using an alpha mask."""
    mask = Image.new('L', im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0) + im.size, radius, fill=255)
    im_rgba = im.convert("RGBA")
    im_rgba.putalpha(mask)
    return im_rgba

def wrap_text(text, font, max_width):
    """Wraps text to fit within a specified pixel width."""
    words = text.split(' ')
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = font.getbbox(test_line)
        width = bbox[2] - bbox[0]
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    return lines

def create_framed_screenshot(raw_im, border_color):
    """Processes a raw screenshot into a beautifully framed presentation card."""
    bg = draw_gradient_background()
    draw = ImageDraw.Draw(bg)

    # 1. Shadow effect
    shadow_mask = Image.new('L', (1610, 910), 0)
    shadow_draw = ImageDraw.Draw(shadow_mask)
    shadow_draw.rounded_rectangle((0, 0, 1610, 910), radius=24, fill=180)
    shadow_blur = shadow_mask.filter(ImageFilter.GaussianBlur(15))
    
    # Create black shadow layer
    shadow_layer = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    shadow_layer.paste((0, 0, 0, 220), (155, 85), shadow_blur)
    bg = Image.alpha_composite(bg.convert("RGBA"), shadow_layer)

    # 2. Glowing Frame Border
    border_layer = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_layer)
    border_draw.rounded_rectangle((158, 78, 1762, 978), radius=22, outline=border_color + (140,), width=3)
    
    # 3. Paste the rounded screenshot (1600x900)
    screenshot_resized = raw_im.resize((1600, 900), Image.Resampling.LANCZOS)
    screenshot_rounded = add_rounded_corners(screenshot_resized, 20)
    
    bg.paste(screenshot_rounded, (160, 80), screenshot_rounded)
    bg = Image.alpha_composite(bg, border_layer)
    
    return bg.convert("RGB")

def draw_subtitles(base_im, text):
    """Draws a semi-transparent subtitle card and centers wrapped subtitle text on it."""
    im = base_im.copy()
    draw = ImageDraw.Draw(im, "RGBA")
    
    # Subtitle background bar
    box_x1 = (1920 - SUBTITLE_BOX_W) // 2
    box_y1 = SUBTITLE_BOX_Y
    box_x2 = box_x1 + SUBTITLE_BOX_W
    box_y2 = box_y1 + SUBTITLE_BOX_H
    
    # Draw dark translucent card
    draw.rounded_rectangle((box_x1, box_y1, box_x2, box_y2), radius=16, fill=(10, 10, 15, 200), outline=(255, 255, 255, 20), width=1)
    
    # Wrap text and render
    try:
        font = ImageFont.truetype(FONT_PATH, 28)
    except IOError:
        font = ImageFont.load_default()
        
    lines = wrap_text(text, font, SUBTITLE_BOX_W - 80)
    
    # Calculate vertical spacing
    line_height = 36
    total_text_h = len(lines) * line_height
    start_y = box_y1 + (SUBTITLE_BOX_H - total_text_h) // 2
    
    for i, line in enumerate(lines):
        bbox = font.getbbox(line)
        line_w = bbox[2] - bbox[0]
        x = box_x1 + (SUBTITLE_BOX_W - line_w) // 2
        y = start_y + i * line_height
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
        
    return im

# -------------------------------------------------------------
# Asset Generators
# -------------------------------------------------------------

def generate_voiceovers():
    """Generates Indian English voiceover snippets using Google Text-to-Speech."""
    log("Generating voiceover audio clips...")
    for idx, sec in enumerate(SECTIONS):
        sec_id = sec["id"]
        text = sec["text"]
        out_path = os.path.join(MARKETING_DIR, f"{sec_id}_voiceover.mp3")
        if os.path.exists(out_path):
            log(f"Voiceover for {sec_id} already exists. Skipping download.")
            continue
        log(f"Creating TTS for section: {sec_id}")
        tts = gTTS(text=text, lang="en", tld="co.in")
        tts.save(out_path)
    log("Voiceovers generated successfully.")

def synthesize_music():
    """Synthesizes a futuristic, deep-space ambient synth pad track via NumPy."""
    log("Synthesizing ambient background music WAV...")
    sample_rate = 44100
    duration = 150  # Length of the track in seconds
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    audio = np.zeros_like(t)

    # Ambient chord progression (each chord holds for 12 seconds with linear crossfade)
    chords_base = [
        [87.31, 174.61, 207.65, 261.63, 311.13, 392.00],  # F minor 9
        [73.42, 138.59, 174.61, 207.65, 261.63],         # Db major 7
        [55.00, 110.00, 130.81, 155.56, 207.65],         # Ab major
        [77.78, 155.56, 196.00, 233.08, 311.13],         # Eb major
    ]
    chords = chords_base * 3 + [chords_base[0], chords_base[1]] # 14 chords -> 168s total
    
    chord_duration = 12.0
    fade_len = int(2.5 * sample_rate)  # 2.5s crossfade
    
    def get_chord_wave(freqs, length):
        ct = np.linspace(0, length, int(sample_rate * length), endpoint=False)
        cwave = np.zeros_like(ct)
        for f in freqs:
            cwave += np.sin(2 * np.pi * f * ct)
            cwave += 0.3 * np.sin(2 * np.pi * (2 * f) * ct)  # Warm 2nd harmonic
            cwave += 0.15 * np.sin(2 * np.pi * (3 * f) * ct) # Soft 3rd harmonic
        cwave /= len(freqs)
        
        # Soft low frequency drone to add premium depth
        cwave += 0.12 * np.sin(2 * np.pi * (freqs[0]/2) * ct)
        
        # Soft low-pass filtering by scaling down high values
        return cwave

    # Construct the continuous track by blending chords
    chord_waves = [get_chord_wave(ch, chord_duration + 3.0) for ch in chords]
    
    current_idx = 0
    for i, cw in enumerate(chord_waves):
        start_sample = int(i * chord_duration * sample_rate)
        end_sample = start_sample + len(cw)
        
        # Apply fade in/out envelopes to each chord slice
        envelope = np.ones(len(cw))
        envelope[:fade_len] = np.linspace(0, 1, fade_len)
        envelope[-fade_len:] = np.linspace(1, 0, fade_len)
        cw_enveloped = cw * envelope
        
        # Pad global audio if needed
        if end_sample > len(audio):
            diff = end_sample - len(audio)
            audio = np.pad(audio, (0, diff))
            
        audio[start_sample:end_sample] += cw_enveloped

    # Master Volume adjustments: keep it soft so voiceover stays clear (volume multiplier = 0.08)
    audio = audio * 0.08
    
    # Smooth fade out at the very end of the track
    total_samples = len(audio)
    outro_fade = int(4.0 * sample_rate)
    audio[-outro_fade:] *= np.linspace(1, 0, outro_fade)

    # Write WAV file
    wav_path = os.path.join(MARKETING_DIR, "background_music.wav")
    audio_data = np.clip(audio, -1.0, 1.0)
    audio_int = (audio_data * 32767).astype(np.int16)
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(audio_int.tobytes())
        
    log(f"Synthesized ambient music saved to: {wav_path}")

def generate_framed_screenshots():
    """Generates branded, framed screenshots (with no subtitles) for marketing listings."""
    log("Generating framed screenshots...")
    for sec in SECTIONS:
        sec_id = sec["id"]
        raw_path = find_screenshot(sec["screenshot_glob"])
        raw_im = Image.open(raw_path)
        
        framed = create_framed_screenshot(raw_im, sec["border_color"])
        out_path = os.path.join(FRAMED_OUT_DIR, f"framed_{sec_id}.png")
        framed.save(out_path)
        log(f"Saved framed screenshot: framed_{sec_id}.png")
    log("All framed screenshots generated.")

def generate_thumbnail():
    """Creates a high-converting, professional YouTube-style thumbnail at exactly 560 x 280 px."""
    log("Generating high-converting 560x280 px thumbnail...")
    
    # 1. Base Layer: Load the high-quality Mumbai digital twin background
    bg_path = os.path.join(MARKETING_DIR, "mumbai_digital_twin_bg.png")
    if os.path.exists(bg_path):
        log(f"Loading high-quality background from: {bg_path}")
        raw_im = Image.open(bg_path)
    else:
        log("mumbai_digital_twin_bg.png not found, falling back to map screenshot...")
        map_raw_path = find_screenshot("map_*.png")
        raw_im = Image.open(map_raw_path)
    
    # Crop map/bg to 560x280 centered
    im_w, im_h = raw_im.size
    target_ratio = 560.0 / 280.0
    if im_w / im_h > target_ratio:
        new_w = int(im_h * target_ratio)
        crop_x = (im_w - new_w) // 2
        map_cropped = raw_im.crop((crop_x, 0, crop_x + new_w, im_h)).resize((560, 280), Image.Resampling.LANCZOS)
    else:
        new_h = int(im_w / target_ratio)
        crop_y = (im_h - new_h) // 2
        map_cropped = raw_im.crop((0, crop_y, im_w, crop_y + new_h)).resize((560, 280), Image.Resampling.LANCZOS)

    # 2. Add subtle blur to background (only if we fell back to map screenshot, otherwise keep AI art crisp)
    if os.path.exists(bg_path):
        map_bg = map_cropped # Keep the AI generated image sharp and clear
    else:
        map_bg = map_cropped.filter(ImageFilter.GaussianBlur(1.5))
        
    draw = ImageDraw.Draw(map_bg, "RGBA")
    
    # Dark vignette/gradient overlay from left (dense black) to right (translucent black)
    for x in range(560):
        # Dense dark panel on the left (x < 240) then fade to right
        if x < 200:
            opacity = 210  # Very dark card
        elif x < 400:
            opacity = int(210 - (210 - 70) * ((x - 200) / 200.0))
        else:
            opacity = int(70 - 70 * ((x - 400) / 160.0))
        draw.line([(x, 0), (x, 280)], fill=(8, 10, 18, opacity))
        
    # 3. Draw Branding & Headline Typography
    try:
        font_brand = ImageFont.truetype(FONT_BOLD_PATH, 11)
        font_title = ImageFont.truetype(FONT_BOLD_PATH, 28)
        font_sub = ImageFont.truetype(FONT_BOLD_PATH, 13)
        font_badge = ImageFont.truetype(FONT_BOLD_PATH, 8)
    except IOError:
        font_brand = font_title = font_sub = font_badge = ImageFont.load_default()

    # Small uppercase label
    draw.text((25, 30), "MUMBAI COGNITIVE DIGITAL TWIN", font=font_brand, fill=(16, 185, 129, 255))
    
    # Bold main title (Glassmorphism neon glow feel)
    # Draw text shadow/glow first
    title_text = "NationTwin AI"
    draw.text((26, 53), title_text, font=font_title, fill=(139, 92, 246, 120))  # Violet glow
    draw.text((25, 52), title_text, font=font_title, fill=(255, 255, 255, 255))
    
    # Sub-headline
    sub_text = "Autonomous Smart City Command Grid"
    draw.text((25, 96), sub_text, font=font_sub, fill=(209, 213, 219, 255))

    # 4. Feature Badges (3 horizontal pills on the left side)
    badges = [
        {"text": "12 AGENTS", "color": (16, 185, 129)},     # Emerald
        {"text": "PREDICTIVE", "color": (139, 92, 246)},   # Violet
        {"text": "SIMULATOR", "color": (245, 158, 11)}      # Amber
    ]
    
    start_x = 25
    y_pos = 135
    for badge in badges:
        text = badge["text"]
        color = badge["color"]
        
        # Calculate badge text width
        bbox = font_badge.getbbox(text)
        txt_w = bbox[2] - bbox[0]
        
        # Pill bounds
        pill_w = txt_w + 14
        pill_h = 16
        
        # Draw pill card
        draw.rounded_rectangle((start_x, y_pos, start_x + pill_w, y_pos + pill_h), radius=4, fill=color + (40,), outline=color + (140,), width=1)
        # Draw dot
        draw.ellipse((start_x + 5, y_pos + 6, start_x + 8, y_pos + 9), fill=color + (255,))
        # Text
        draw.text((start_x + 11, y_pos + 3), text, font=font_badge, fill=(255, 255, 255, 240))
        
        start_x += pill_w + 8
        
    # 5. Glowing border around the entire thumbnail (2px inset)
    draw.rectangle((0, 0, 560, 280), outline=(139, 92, 246, 90), width=2) # violet subtle boundary glow
    
    # Save output
    thumb_path = os.path.join(OUTPUT_DIR, "thumbnail.png")
    map_bg.convert("RGB").save(thumb_path)
    
    # Also save to marketing/thumbnail.png in workspace
    workspace_thumb_path = os.path.join(MARKETING_DIR, "thumbnail.png")
    map_bg.convert("RGB").save(workspace_thumb_path)
    
    # Save to the current conversation's artifact folder
    current_chat_artifact_path = "/home/abhishekraj10001/.gemini/antigravity-ide/brain/3f16175f-0b5b-4c47-9de4-df57cca65e9d/thumbnail.png"
    map_bg.convert("RGB").save(current_chat_artifact_path)
    
    log(f"Thumbnail rendered and saved to: {thumb_path}")
    log(f"Thumbnail copied to workspace: {workspace_thumb_path}")
    log(f"Thumbnail saved to artifacts: {current_chat_artifact_path}")

# -------------------------------------------------------------
# Video Builder & Stitcher
# -------------------------------------------------------------

def assemble_cinematic_video():
    """Assembles the final video combining framed screens, audio, subtitles, music and pan transitions."""
    log("Starting video assembly and rendering...")
    
    final_clips = []
    
    for idx, sec in enumerate(SECTIONS):
        sec_id = sec["id"]
        text = sec["text"]
        border_color = sec["border_color"]
        
        log(f"Processing video clip for section: {sec_id}")
        
        # 1. Load raw screenshot & create base framed image
        raw_path = find_screenshot(sec["screenshot_glob"])
        raw_im = Image.open(raw_path)
        framed_base = create_framed_screenshot(raw_im, border_color)
        
        # 2. Load corresponding voiceover audio to determine clip length
        audio_path = os.path.join(MARKETING_DIR, f"{sec_id}_voiceover.mp3")
        voice_clip = AudioFileClip(audio_path)
        duration = voice_clip.duration
        
        log(f"Section {sec_id} duration: {duration:.2f}s")
        total_frames = int(duration * FPS)
        
        # 3. Generate animation frames (with zoom & static subtitles drawn in Pillow)
        frames_list = []
        for f in range(total_frames):
            # Slow zoom in: scale the screenshot slowly
            # We scale from 1.0 (start) to 1.04 (end)
            progress = f / float(total_frames - 1) if total_frames > 1 else 0
            scale = 1.0 + 0.04 * progress
            
            # Zoom logic: crop the raw screenshot around center and resize to 1600x900
            im_w, im_h = raw_im.size
            crop_w = int(im_w / scale)
            crop_h = int(im_h / scale)
            x1 = (im_w - crop_w) // 2
            y1 = (im_h - crop_h) // 2
            x2 = x1 + crop_w
            y2 = y1 + crop_h
            
            zoomed_shot = raw_im.crop((x1, y1, x2, y2))
            
            # Frame the zoomed screenshot
            framed_frame = create_framed_screenshot(zoomed_shot, border_color)
            
            # Draw subtitles on top of the frame
            subtitled_frame = draw_subtitles(framed_frame, text)
            
            # Apply fade in / fade out at the boundaries of the section (blend to/from black)
            frame_arr = np.array(subtitled_frame, dtype=np.float32)
            fade_frames = int(0.4 * FPS)  # 0.4s fade
            if f < fade_frames:
                factor = f / float(fade_frames)
                frame_arr = frame_arr * factor
            elif f > (total_frames - fade_frames):
                factor = (total_frames - 1 - f) / float(fade_frames)
                frame_arr = frame_arr * factor
                
            frames_list.append(frame_arr.astype(np.uint8))
            
        # 4. Create VideoClip from frames list
        def make_frame(t):
            frame_idx = int(t * FPS)
            return frames_list[min(frame_idx, len(frames_list) - 1)]
            
        vid_clip = VideoClip(make_frame, duration=duration)
        # Sync with audio
        vid_clip = vid_clip.with_audio(voice_clip)
        
        final_clips.append(vid_clip)
        
    log("Concatenating all sections into a single clip...")
    full_video = concatenate_videoclips(final_clips, method="compose")
    
    # 5. Mix synthesized ambient music
    music_path = os.path.join(MARKETING_DIR, "background_music.wav")
    bg_music = AudioFileClip(music_path)
    
    # Trim background music to match video duration safely
    bg_music_trimmed = bg_music.subclipped(0, min(bg_music.duration, full_video.duration))
    
    # Composite the audio clips
    composite_audio = CompositeAudioClip([full_video.audio, bg_music_trimmed])
    full_video = full_video.with_audio(composite_audio)
    
    # 6. Render final file
    out_mp4 = os.path.join(OUTPUT_DIR, "demo_video.mp4")
    log(f"Rendering final cinematic video (1080p, {FPS} FPS) to: {out_mp4}")
    
    full_video.write_videofile(
        out_mp4,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="ultrafast",
        threads=4,
        bitrate="2500k",
        logger="bar"
    )
    
    log(f"Cinematic demo video saved to: {out_mp4}")

# -------------------------------------------------------------
# Main Execution Entrypoint
# -------------------------------------------------------------

if __name__ == "__main__":
    log("Starting marketing assets generator...")
    try:
        generate_voiceovers()
        synthesize_music()
        generate_framed_screenshots()
        generate_thumbnail()
        assemble_cinematic_video()
        log("ALL MARKETING ASSETS GENERATED SUCCESSFULY!")
    except Exception as e:
        log(f"ERROR OCCURRED DURING BUILD: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e
