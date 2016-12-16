if (document.querySelector(".drag-module")) {
    feedMe(document.querySelector(".drag-module"));

    var drag = document.querySelector(".drag-module").feedMe;

    var uploadButton = document.querySelector(".drag-module-wrap .input-submit");

    if (uploadButton) {
        uploadButton.addEventListener("click", function (event) {
            drag.postFilesTo(drag.node.dataset.action)
                .then(function (response) {
                    if (response == 200) {
                        console.log("OK");
                        top.location.reload();
                    } else {
                        drag.node.innerHTML = response;
                    }
                })
        })
    }
}