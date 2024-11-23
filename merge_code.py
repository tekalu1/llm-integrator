import os

def read_files_recursively(directory, exclude_dirs=None, exclude_files=None, exclude_exts=None):
    all_text = []
    if exclude_dirs is None:
        exclude_dirs = []
    if exclude_files is None:
        exclude_files = []
    if exclude_exts is None:
        exclude_exts = []

    for root, dirs, files in os.walk(directory):
        # 除外ディレクトリを取り除く
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file in exclude_files or any(file.endswith(ext) for ext in exclude_exts):
                continue

            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, directory)

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    all_text.append(f'--- {relative_path} ---\n')
                    all_text.append(f.read())
                    all_text.append('\n\n')
            except UnicodeDecodeError:
                print(f"Skipping file {file_path} due to encoding error.")
    
    return ''.join(all_text)

def save_to_file(text, output_file):
    # 上書き保存モードでファイルを開く
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)

def main():
    directory = os.path.dirname(os.path.abspath(__file__))  # 現在のファイルがあるディレクトリを取得
    output_file = "merged_code.txt"

    exclude_dirs = "bin,obj,.output,.nuxt,.output,dist,dist-electron,release,node_modules,.git".split(',')
    exclude_files = (output_file + ",README.md,merge_code.py,package-lock.json,yarn.lock").split(',')
    exclude_exts = "lock".split(',')

    exclude_dirs = [d.strip() for d in exclude_dirs if d.strip()]
    exclude_files = [f.strip() for f in exclude_files if f.strip()]
    exclude_exts = [e.strip() for e in exclude_exts if e.strip()]

    all_text = read_files_recursively(directory, exclude_dirs, exclude_files, exclude_exts)
    save_to_file(all_text, output_file)
    print(f"全てのソースコードを {output_file} に保存しました。")

if __name__ == "__main__":
    main()
