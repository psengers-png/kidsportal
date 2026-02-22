
const kleurplaatContainer = document.getElementById("kleurplaatContainer");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

const kleurplaten = [
    "Images/Driply.png",
    "Images/Giggly.png",
    "Images/Beatty.png",
    "Images/Questy.png"
];

let currentImage = "";

generateBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * kleurplaten.length);
    currentImage = kleurplaten[randomIndex];
    kleurplaatContainer.innerHTML = `<img src="${currentImage}" alt="Kleurplaat" />`;
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
