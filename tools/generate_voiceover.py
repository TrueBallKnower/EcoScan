"""Produce the French concept-film narration locally; never used by the website.

Requires optional production packages kokoro-onnx==0.4.9, NumPy, onnxruntime and
ffmpeg. Supply the Kokoro v1.0 ONNX model and voices-v1.0.bin as local files.
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
MAX_TEMPO = 1.15


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
    rate = 24000
    master = np.zeros(rate * DURATION, dtype=np.float32)
    cues, report = [], []
    for group_index, group in enumerate(groups):
        blocks = []
        for sentence_index, entry in enumerate(group["sentences"]):
            entry = {"text": entry} if isinstance(entry, str) else entry
            text = entry["text"]
            audio, sample_rate = engine.create(entry.get("spoken", text), voice=args.voice, lang="fr-fr", speed=1.0)
            assert sample_rate == rate
            audio = np.asarray(audio, dtype=np.float32).reshape(-1)
            path = out / f"segment-{group_index:02}-{sentence_index:02}.wav"
            write_wave(path, audio, rate)
            blocks.append({"text": text, "audio": audio, "path": path})
        route = 50 <= group["start"] < 62
        lead = .10 if route else .24
        tail = .08 if route else .24
        pause = .18
        available = group["end"] - group["start"] - lead - tail - pause * (len(blocks) - 1)
        natural = sum(len(block["audio"]) for block in blocks) / rate
        tempo = max(1.0, natural / available)
        if tempo > MAX_TEMPO:
            raise ValueError(f"Narration too long in {group['start']}–{group['end']} seconds: tempo {tempo:.3f}; shorten the text instead of rushing the voice.")
        if tempo > 1.0001:
            for block in blocks:
                adjusted = block["path"].with_suffix(".fit.wav")
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(block["path"]), "-af", f"atempo={tempo:.8f}", "-ac", "1", "-ar", str(rate), str(adjusted)], check=True)
                block["audio"], _ = read_wave(adjusted)
        cursor = group["start"] + lead
        for block in blocks:
            samples = block["audio"]
            # Gentle short fades remove splice clicks without shortening words.
            fade = min(int(rate * .008), len(samples) // 2)
            if fade:
                samples[:fade] *= np.linspace(0, 1, fade)
                samples[-fade:] *= np.linspace(1, 0, fade)
            position = round(cursor * rate)
            master[position:position + len(samples)] += samples
            end = cursor + len(samples) / rate
            cues.append({"start": round(cursor, 3), "end": round(min(group["end"], end + .10), 3), "text": block["text"]})
            cursor = end + pause
        assert cursor - pause <= group["end"] + .02, "Narration crosses a chapter boundary"
        report.append({"start": group["start"], "end": group["end"], "natural_seconds": round(natural, 3), "tempo": round(tempo, 5), "speech_end": round(cursor - pause, 3)})
        print(json.dumps(report[-1], ensure_ascii=False), flush=True)
    # Normalize only once across the entire film, preserving sentence dynamics.
    peak = float(np.max(np.abs(master)))
    master *= min(1.0, .86 / peak) if peak else 1.0
    destination = out / "narration-fr.wav"
    write_wave(destination, master, rate)
    cues[-1]["end"] = float(DURATION)
    (out / "cues-fr.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    vtt = "WEBVTT\n\n" + "\n\n".join(f"{index}\n{timestamp(cue['start'])} --> {timestamp(cue['end'])}\n{cue['text']}" for index, cue in enumerate(cues, 1)) + "\n"
    (out / "narration-fr.vtt").write_text(vtt, encoding="utf-8")
    metadata = {"voice": args.voice, "language": "fr-fr", "engine": "kokoro-onnx 0.4.9", "sample_rate": rate, "duration": DURATION, "model_sha256": hashlib.sha256(Path(args.model).read_bytes()).hexdigest(), "voices_sha256": hashlib.sha256(Path(args.voices).read_bytes()).hexdigest(), "narration_sha256": hashlib.sha256(destination.read_bytes()).hexdigest(), "maximum_tempo": max(item["tempo"] for item in report), "groups": report}
    (out / "generation-report.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"wav": str(destination), "cues": len(cues), "max_tempo": metadata["maximum_tempo"]}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", required=True)
    parser.add_argument("--voices", required=True)
    parser.add_argument("--voice", default="ff_siwis")
    parser.add_argument("--script", default=str(ROOT / "tools/narration_fr.json"))
    parser.add_argument("--output", default="/tmp/ecoscan-voiceover/output")
    generate(parser.parse_args())
