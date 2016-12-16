"use strict";
require("whatwg-fetch");
class FeedMe {
    /**
     * Конструктор получает на входе DOM Node и навешивает на него события
     * dragenter, dragover, dragleave и drop
     * @param node
     */
    constructor(node) {
        this._files = {};
        this.node = node;

        let self = this;

        node.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        node.addEventListener("dragenter", function (event) {
            event.preventDefault();
            self.node.classList.add("something-inside");
        });
        node.addEventListener("dragleave", function (event) {
            event.preventDefault();
            self.node.classList.remove("something-inside");
        });
        node.addEventListener("drop", function (event) {
            event.preventDefault();

            let files = FeedMe.validateFiles(event.dataTransfer.files);

            if (files) {
                files.forEach(function (file) {
                    self.addFile(file);
                })
            } else {
                console.error("one ore more files is not valid JPG");
            }

            self.node.classList.remove("something-inside");

        });

        node.addEventListener("click", function () {
            self.getFilesFromMultiselect();
        })
    }

    /**
     * Проверяет являются ли файлы в массиве files картинками
     * Возвращает массив с выбранными файлами если валидно,
     * иначе возвращает false
     *
     * @param files
     * @returns {Array} Array of Files
     */

    static validateFiles(files) {
        let result = [];
        for (let i = 0; i< files.length; i++) {
            let item = files[i];
            if (!(item.type === "image/jpeg")) {
                console.error("one ore more files is not valid JPG");
                alert("Ошибка! Загружайте только JPG!");
                return false;
            } else {
                result.push(item);
            }
        }
        return result;
    }

    /**
     * Будет добавлять файл инпут и собирать с него данные
     * о выбранных файлах
     */
    getFilesFromMultiselect() {
        let self = this;

        let  uploadInput = document.createElement("input");

        uploadInput.type = "file";

        uploadInput.multiple = true;

        uploadInput.id = "fdrag_temp_input";

        document.body.appendChild(uploadInput);

        uploadInput.addEventListener("change", function () {
            let files = FeedMe.validateFiles(uploadInput.files);

            if (files) {
                files.forEach(function (file) {
                    self.addFile(file);
                })
            } else {
                console.error("one ore more files is not valid JPG");
            }

            self.node.classList.remove("something-inside");
        });

        let event = new MouseEvent("click", {
            "view": window,
            "bubbles": false,
            "cancelable": true
        });
        uploadInput.dispatchEvent(event);

        uploadInput.remove();
    }

    /**
     * Добавляет в объект _files новый объект
     * с uuid сгенерированным именем
     * uuid: {file: [File object], uuid: uuid}
     * @param file объект типа File (см. File API)
     */
    addFile(file) {
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4()  + s4()  + s4()  +
                s4()  + s4() + s4() + s4()+"";
        }
        let self = this;

        let newGuid = guid();

        let img = new Image();
        let imgDiv = document.createElement("div");

        img.src = URL.createObjectURL(file);

        img.onload = function () {
            URL.revokeObjectURL(this.src);
        };

        this.node.appendChild(imgDiv);

        imgDiv.classList.add("feedme-file");

        imgDiv.appendChild(img);

        imgDiv.addEventListener("click", function (event) {
            event.stopPropagation();
            self.deleteFile(newGuid);
        });

        this._files[newGuid] = {file: file, id: newGuid, node: imgDiv};

    }

    /**
     * Удаляет свойство(объект) с указанным uuid
     * из объекта _files
     * @param guid
     */
    deleteFile(guid) {
        let self = this;

        self._files[guid].node.remove();

        delete self._files[guid];

    }

    /**
     * возвращает свойства (файлы) объекта _files
     * в виде массива объектов File
     * @returns {Array}
     */
    getFiles() {
        let self = this;
        let result = [];
        for (let file in self._files) {
            if (self._files.hasOwnProperty(file)) {
                result.push(self._files[file].file);
            }
        }
        return result;
    }

    /**
     * очищает массив files и вызывает метод
     * синхронизации
     */
    clearFiles() {
        let self = this;

        for (let file in self._files) {
            if (self._files.hasOwnProperty(file)) {
                self.deleteFile(file);
            }
        }

    }

    /**
     * отправляет файлы методом post на заданный url
     * @param url
     */
    postFilesTo(url) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (self.getFiles().length>0) {
                let data = new FormData();
                let files = self.getFiles();
                files.forEach(function (file, index) {
                    data.append("file"+(index+1), file);
                });

                self.node.classList.add("waiting");

                fetch(url, {
                    method: "POST",
                    body: data
                }).then(function (response) {
                    response.text().then(function(blob) {
                        self.node.classList.remove("waiting");
                        self.clearFiles();
                        resolve(blob);
                    }, function (blob) {
                        self.node.classList.remove("waiting");
                        reject(blob);
                    });
                }).catch(function(error) {
                    self.node.classList.remove("waiting");
                    reject(error);
                });

            }
        });

    }
}
const feedme = function (node) {
    node.feedMe = new FeedMe(node);
};

window.feedMe = feedme;