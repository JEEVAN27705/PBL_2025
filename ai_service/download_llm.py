from huggingface_hub import hf_hub_download

repo_id = "microsoft/Phi-3-mini-4k-instruct-gguf"
filename = "Phi-3-mini-4k-instruct-q4.gguf"

print(f"Downloading {filename} from {repo_id}...")
try:
    hf_hub_download(repo_id=repo_id, filename=filename, local_dir=".")
    print("Download complete!")
except Exception as e:
    print(f"Failed to download: {e}")
