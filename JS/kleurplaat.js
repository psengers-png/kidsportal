
const kleurplaatContainer = document.getElementById("kleurplaatContainer");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

const kleurplaten = [
    "images/kleurplaat1.png",
    "images/kleurplaat2.png",
    "images/kleurplaat3.png"
];

let currentImage = "";

generateBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * kleurplaten.length);
    currentImage = kleurplaten[randomIndex];
    kleurplaatContainer.innerHTML = `${currentImage}`;
    downloadBtn.style.display = "inline-block";
});

downloadBtn.addEventListener("click", () => {
    if (currentImage) {
        const link = document.createElement("a");
        link.href = currentImage;
        link.download = "kleurplaat.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
