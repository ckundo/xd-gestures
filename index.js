const keypress = (key) => {
  const event = new KeyboardEvent("keydown", { key: key });
  document.querySelector("#root-1").dispatchEvent(event);
};

const right = () => { keypress("l"); };
const left = () => { keypress("h"); };
const confirm = () => { keypress("e"); };
const back = () => { keypress("q"); };

const startCamera = (video) => {
  video.width = video.width || 640;
  video.height = video.height || video.width * (3 / 4)

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: "user"
      }
    })
    .then(stream => {
      window.localStream = stream;
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
      }
      return video;
    }).catch(console.error);
}

document.querySelector("#gestures").onclick = () => {
  const video = document.createElement("video");
  document.appendChild(video);
  video.style.position = "fixed";
  video.style.top = 10;
  video.style.left = 10;

  const video = await startCamera(video);
  posenet.load().then(net => {
    const pose = net.estimateSinglePose(video);
    console.log(pose);
  });
}
