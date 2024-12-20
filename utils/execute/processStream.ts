export async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: any) => void
) {
  const decoder = new TextDecoder("utf-8");
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split('\n');
    buffer = lines.pop() || ''; 

    for (const line of lines) {
      if (line.trim()) {
        const jsonData = JSON.parse(line);
        onData(jsonData);
      }
    }
  }
}