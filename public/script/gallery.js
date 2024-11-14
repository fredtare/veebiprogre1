window.onload = function() {
    // punkt on klassi tunnus
    let allThumbs = document.querySelector ("#gallery").querySelectorAll(".thumbs");
    for (let i= 0; i < allThumbs.length; i++){
        //anname igale elemendile syndmusekuulaja
        allThumbs[i].addEventListener("click", openModal);
    }
    document.querySelector("#modalClose").addEventListener("click", closeModal)
};

function openModal(clickEvent) {
    
    console.log(clickEvent);

    document.querySelector("#modalCaption").innerHTML = clickEvent.target.alt;
    document.querySelector("#modalImage").src = "/gallery/normal/" + clickEvent.target.dataset.filename
    document.querySelector("#modal").showModal();
};

function closeModal(){
    document.querySelector("#modal").close();
    document.querySelector("#modalImage").src = "/pics/empty.jpg";
    document.querySelector("#modalCapture").innerHTML = "tyhipilt"

}