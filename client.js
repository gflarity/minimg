// The index in files : string[] (see minimg.tsx) that we're currently viewing
let index = 0;

<<<<<<< Updated upstream
self.addEventListener("load", function () {
  updateImageAndTitle()
=======
window.addEventListener("load", function () {
  const viewer = document.getElementById("viewer");
  viewer.src = encodeURI(files[0]);
>>>>>>> Stashed changes
});

// listen for the the ArrowLeft event
document.addEventListener("keydown", function (event) {
  const keyName = event.key;

  if (keyName === "ArrowLeft" && index > 0) {
    index--;
  }

  if (keyName === "ArrowRight" && index < files.length - 1) {
    index++;
  }
<<<<<<< Updated upstream
 
  updateImageAndTitle();
=======

  // update the image we're viewing
  const viewer = document.getElementById("viewer");
  viewer.src = encodeURI(files[index]);
>>>>>>> Stashed changes

  // notify server of the event and current src
  const formData = new FormData();
  formData.append("key", event.key);
  formData.append("src", document.getElementById("viewer").src);
  fetch(window.location.href + "keydown", { method: "POST", body: formData });
});

// update the image and title
function updateImageAndTitle() {
  const viewer = document.getElementById("viewer");
  viewer.src = files[index];

  const title = document.getElementById("title");

  // get just the file name from the path set it as the innerText of the title
  const path = files[index].split("/");
  title.innerText = path[path.length - 1];
}
