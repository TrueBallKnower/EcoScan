"""Produce contextual French/English narration locally; not a website dependency.

Requires optional production packages kokoro-onnx==0.4.9, NumPy, onnxruntime and
ffmpeg. English also uses misaki==0.9.4, num2words, spaCy and en_core_web_sm 3.8.0.
Supply the Kokoro v1.0 ONNX model and voices-v1.0.bin as local files.
The installation, voice inference and intermediate files can stay under /tmp.
No API key, subscription, hosted synthesis or imitation of a named person.

Verified sources and licensing are documented in docs/VOIX_OFF.md.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import wave

ROOT = Path(__file__).resolve().parents[1]
DURATION = 92
MAX_TEMPO = 1.10


def write_wave(path, samples, rate):
    import numpy as np
    with wave.open(str(path), "wb") as output:
        output.setparams((1, 2, rate, 0, "NONE", ""))
        output.writeframes((np.clip(samples, -1, 1) * 32767).astype("<i2").tobytes())


def read_wave(path):
    import numpy as np
    with wave.open(str(path), "rb") as source:
        assert source.getnchannels() == 1 and source.getsampwidth() == 2
        return np.frombuffer(source.readframes(source.getnframes()), dtype="<i2").astype(np.float32) / 32767, source.getframerate()


def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    return f"{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}"


def write_vtt(path, cues):
    text = "WEBVTT\n\n" + "\n\n".join(f"{index}\n{timestamp(cue['start'])} --> {timestamp(cue['end'])}\n{cue['text']}" for index, cue in enumerate(cues, 1)) + "\n"
    Path(path).write_text(text, encoding="utf-8")


def subtitle_boundaries(audio, weights, rate):
    """Place subtitle breaks near quiet phrase boundaries in one continuous take.

    Speech is rendered once per chapter, rather than restarted for every cue.
    Relative phoneme lengths provide an initial boundary; a nearby quiet 40 ms
    window aligns the caption change with the naturally rendered pause.
    """
    import numpy as np
    boundaries = [0]
    total = sum(weights)
    accumulated = 0
    duration = len(audio) / rate
    window = int(rate * .04)
    for weight in weights[:-1]:
        accumulated += weight
        estimate = duration * accumulated / total
        left = max(boundaries[-1] + .25, estimate - .30)
        right = min(duration - .25, estimate + .30)
        candidates = np.arange(left, right, .012)
        if len(candidates):
            energy = [float(np.mean(audio[round(t * rate):round(t * rate) + window] ** 2)) for t in candidates]
            # Favor pauses near the predicted textual break over distant gaps.
            scores = [value * (1 + abs(t - estimate) * 3) for value, t in zip(energy, candidates)]
            boundaries.append(float(candidates[int(np.argmin(scores))]))
        else:
            boundaries.append(estimate)
    return boundaries + [duration]


def mux_voice(video, voice, destination):
    """Keep the existing H.264 stream exactly; replace only its sound mix."""
    filters = "[0:a]volume=0.52[bed];[1:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-18:TP=-2:LRA=7,asplit=2[voice][side];[bed][side]sidechaincompress=threshold=0.02:ratio=10:attack=45:release=600[ducked];[ducked][voice]amix=inputs=2:normalize=0,alimiter=limit=0.95:level=0[mix]"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video), "-i", str(voice), "-filter_complex", filters, "-map", "0:v:0", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-movflags", "+faststart", "-t", str(DURATION), str(destination)], check=True)


def generate(args):
    import numpy as np
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    groups = json.loads(Path(args.script).read_text(encoding="utf-8"))
    # A small CPU pool keeps synthesis predictable alongside optional 3D renders.
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    options.inter_op_num_threads = 1
    engine = Kokoro.from_session(ort.InferenceSession(args.model, options, providers=["CPUExecutionProvider"]), args.voices)
    if args.language.startswith("en"):
        from misaki import en, espeak
        import spacy
        if not spacy.util.is_package("en_core_web_sm"):
            raise RuntimeError("Install the optional en_core_web_sm 3.8.0 production model first; synthesis does not download services or models.")
        phonemizer = en.G2P(trf=False, british=args.language == "en-gb", fallback=espeak.EspeakFallback(british=args.language == "en-gb"))
        phonemes = lambda text: phonemizer(text)[0]
        phonemizer_name = "Misaki English 0.9.4 / en_core_web_sm 3.8.0"
    else:
        phonemes = lambda text: engine.tokenizer.phonemize(text, args.language)
        phonemizer_name = "eSpeak NG French"
    rate = 24000
    master = np.zeros(rate * DURATION, dtype=np.float32)
    code = args.language.split("-")[0]
    cues, translations, report = [], [], []
    for group_index, group in enumerate(groups):
        entries = [{"text": entry} if isinstance(entry, str) else entry for entry in group["sentences"]]
        paragraph = " ".join(entry.get("spoken", entry["text"]) for entry in entries)
        paragraph_phonemes = phonemes(paragraph)
        if len(paragraph_phonemes) >= 510:
            raise ValueError("A narration chapter exceeds the voice context; shorten it instead of truncating speech.")
        audio, sample_rate = engine.create(paragraph_phonemes, voice=args.voice, is_phonemes=True, speed=1.0)
        assert sample_rate == rate
        audio = np.asarray(audio, dtype=np.float32).reshape(-1)
        path = out / f"chapter-{code}-{group_index:02}.wav"
        write_wave(path, audio, rate)
        route = 50 <= group["start"] < 62
        lead = .10 if route else .24
        tail = .08 if route else .24
        available = group["end"] - group["start"] - lead - tail
        natural = len(audio) / rate
        tempo = max(1.0, natural / available)
        if tempo > MAX_TEMPO:
            raise ValueError(f"Narration too long in {group['start']}–{group['end']} seconds: tempo {tempo:.3f}; shorten the text instead of rushing the voice.")
        if tempo > 1.0001:
            adjusted = path.with_suffix(".fit.wav")
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path), "-af", f"atempo={tempo:.8f}", "-ac", "1", "-ar", str(rate), str(adjusted)], check=True)
            audio, _ = read_wave(adjusted)
        # Each chapter retains its own natural sentence rhythm and breathing.
        fade = min(int(rate * .008), len(audio) // 2)
        if fade:
            audio[:fade] *= np.linspace(0, 1, fade)
            audio[-fade:] *= np.linspace(1, 0, fade)
        start = group["start"] + lead
        position = round(start * rate)
        master[position:position + len(audio)] += audio
        end = start + len(audio) / rate
        assert end <= group["end"] + .02, "Narration crosses a chapter boundary"
        weights = [max(1, len(phonemes(entry.get("spoken", entry["text"])))) for entry in entries]
        boundaries = subtitle_boundaries(audio, weights, rate)
        for index, entry in enumerate(entries):
            cue = {"start": round(start + boundaries[index], 3), "end": round(min(group["end"], start + boundaries[index + 1] + (.1 if index == len(entries) - 1 else 0)), 3), "text": entry["text"]}
            cues.append(cue)
            if "translation_fr" in entry:
                translations.append({**cue, "text": entry["translation_fr"]})
        report.append({"start": group["start"], "end": group["end"], "natural_seconds": round(natural, 3), "tempo": round(tempo, 5), "speech_end": round(end, 3)})
        print(json.dumps(report[-1], ensure_ascii=False), flush=True)
    # Normalize only once across the entire film, preserving sentence dynamics.
    peak = float(np.max(np.abs(master)))
    master *= min(1.0, .86 / peak) if peak else 1.0
    destination = out / f"narration-{code}.wav"
    write_wave(destination, master, rate)
    cues[-1]["end"] = float(DURATION)
    (out / f"cues-{code}.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_vtt(out / f"narration-{code}.vtt", cues)
    if args.captions_output:
        write_vtt(args.captions_output, cues)
    if translations:
        assert len(translations) == len(cues)
        translations[-1]["end"] = float(DURATION)
        write_vtt(out / "narration-en-fr.vtt", translations)
        (out / "cues-en-fr.json").write_text(json.dumps(translations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if args.translation_output:
            write_vtt(args.translation_output, translations)
    metadata = {"voice": args.voice, "language": args.language, "engine": "kokoro-onnx 0.4.9", "phonemizer": phonemizer_name, "contextual_synthesis": True, "sample_rate": rate, "duration": DURATION, "model_sha256": hashlib.sha256(Path(args.model).read_bytes()).hexdigest(), "voices_sha256": hashlib.sha256(Path(args.voices).read_bytes()).hexdigest(), "narration_sha256": hashlib.sha256(destination.read_bytes()).hexdigest(), "maximum_tempo": max(item["tempo"] for item in report), "groups": report}
    (out / "generation-report.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.film_output:
        if not args.video_base:
            raise ValueError("--film-output requires --video-base with the original music-only picture stage")
        mux_voice(args.video_base, destination, args.film_output)
    print(json.dumps({"wav": str(destination), "cues": len(cues), "max_tempo": metadata["maximum_tempo"]}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", required=True)
    parser.add_argument("--voices", required=True)
    parser.add_argument("--voice", default="ff_siwis")
    parser.add_argument("--language", default="fr-fr", choices=["fr-fr", "en-us", "en-gb"])
    parser.add_argument("--script", default=str(ROOT / "tools/narration_fr.json"))
    parser.add_argument("--output", default="/tmp/ecoscan-voiceover/output")
    parser.add_argument("--video-base", help="Existing picture stage with original music and no narration")
    parser.add_argument("--film-output", help="MP4 destination; existing H.264 image stream is copied unchanged")
    parser.add_argument("--captions-output", help="Optional public WebVTT destination")
    parser.add_argument("--translation-output", help="Optional French-translation WebVTT destination for English")
    generate(parser.parse_args())
