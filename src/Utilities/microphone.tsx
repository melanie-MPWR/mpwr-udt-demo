export async function getMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    return new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error("Microphone access denied");
  }
}

export async function closeMicrophone(microphone: MediaRecorder) {
  try {
    if (microphone.state === "recording") {
      microphone.stop();
      console.log("Microphone stopped");
    }
  } catch (error) {
    console.error("Error stopping microphone:", error);
    throw new Error("Failed to stop the microphone");
  }
}

export async function openMicrophone(
  microphone: MediaRecorder,
  socket: WebSocket
) {
  return new Promise<void>((resolve) => {
    microphone.onstart = () => {
      console.log("Microphone started");
      resolve();
    };

    microphone.onstop = () => {
      console.log("Microphone stopped");
    };

    microphone.ondataavailable = (event: { data: { size: number } }) => {
      console.log("Microphone data available:", event.data.size);
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(event.data as Blob);
      }
    };

    microphone.start(1000); // Start recording with a 1-second interval
    console.log("Microphone started");
  });
}

export async function start(socket: WebSocket) {
  let microphone;
  if (!microphone) {
    try {
      microphone = await getMicrophone();
      await openMicrophone(microphone, socket);
    } catch (error) {
      console.error("Error starting microphone:", error);
      throw new Error("Failed to start the microphone");
    }
  } else {
    await closeMicrophone(microphone);
    microphone = undefined;
  }
}

export function closeWebSocket(socket: WebSocket) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close();
    console.log("WebSocket closed");
  } else {
    console.log("WebSocket is not open");
  }
}
