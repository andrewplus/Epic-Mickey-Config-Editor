let savePath = "";
if (PLATFORM === "desktop") {
    if (localStorage.getItem("savePath") === null) {
        savePath = "C:\\"
    } else {
        savePath = localStorage.getItem("savePath");
    }
}

function exportOverlay() {
    currentOverlay = "export";
    const exportContent = document.querySelector(".overlay-export .content");
    exportContent.innerHTML = '<div class="text-center">' + returnSaveWeb() + returnSaveDesktop() + returnRiivolutionWeb() + '</div>';
    exportContent.innerHTML += '<textarea onclick="this.select()">' + returnCmdline() + '</textarea>';
}

// Return HTML
function returnSaveWeb() {
    if (PLATFORM === "web") {
        return '<span class="button" onclick="saveWeb()">Save cmdline.txt</span>';
    } else {
        return "";
    }
}

function returnRiivolutionWeb() {
    if (PLATFORM === "web") {
        return '<span class="button" onclick="riivolutionWeb()">Save Riivolution patch</span>';
    } else {
        return "";
    }
}

function returnSaveDesktop() {
    if (PLATFORM === "desktop") {
        return '<div class="save-desktop"><input class="save-path" onfocus="changeSavePath()" value="' + savePath + '"><span class="button" onclick="saveDesktop()">Save cmdline.txt</span></div>';
    } else {
        return "";
    }
}

// Change path
function changeSavePath() {
    window.__TAURI__.dialog.open({ filters: [{ name: "cmdline.txt file", extensions: ["txt"] }] })
        .then(PromiseResult => {
            if (PromiseResult) {
                savePath = PromiseResult;
                document.querySelector(".save-path").value = PromiseResult;
                localStorage.setItem("savePath", PromiseResult);
            } else {
                console.log("No file provided");
            }
        });

    document.querySelector(".save-path").blur();
}

// Save functions
function saveWeb() {
    const blob = new Blob([returnCmdline()], { type: "text/plain;charset=utf-8" });
    window.saveAs(blob, "cmdline.txt");
}

function riivolutionWeb() {
    var zip = new JSZip();

    zip.file("empatch/cmdline.txt", returnCmdline());
    zip.file("apps/riivolution/levelpatch.xml", "<wiidisc version=\"1\"> <id game=\"SEM\" /> <options> <section name=\"Epic Mickey Patches\"> <option name=\"cmdline.txt patch\" id=\"levelpatch\" default=\"1\"> <choice name=\"Enabled\"><patch id=\"levelpatch\"/></choice> </option> </section> </options> <patch id=\"levelpatch\"> <folder external=\"/empatch\" disc=\"/\" /> </patch> </wiidisc>");

    var promise = null;
    if (JSZip.support.uint8array) {
        promise = zip.generateAsync({ type: "uint8array" });
    } else {
        promise = zip.generateAsync({ type: "string" });
    }

    zip.generateAsync({ type: "blob" }).then(function (blob) {
        window.saveAs(blob, "epic-mickey-patch.zip");
    }, function (err) {
        alert("Zip file could not be generated. Please contact the developer.");
    });
}

function saveDesktop() {
    window.__TAURI__.invoke("save", { path: savePath, cmdline: returnCmdline() })
        .then(PromiseResult => {
            if (PromiseResult == 0) {
                message("File has been overwritten!", "rgba(0,225,0,0.2)");
            } else if (PromiseResult == 1) {
                message("ERROR: File path could not be found.", "rgba(225,0,0,0.2)");
            } else if (PromiseResult == 2) {
                message("File was found, but could not be written to. Check write permissions.", "rgba(225,0,0,0.2)");
            }
        });

    /*
    if (savePath.split('.').pop() === "txt") {
        Neutralino.filesystem.writeFile(savePath, returnCmdline(),
            function (data) {
                Neutralino.filesystem.readFile(savePath,
                    function (data) {
                        if (data.content === returnCmdline() + "\n") { // there is a \n at the end of the file for some reason, so we have to account for this
                            message("File saved!", "rgba(0,225,0,0.2)");
                        } else {
                            // code 1: file contents of the destination were different; the old file was not overwritten
                            // permission errors would most commonly fall under this
                            message("File could not be saved: check file permissions. (code: 1)", "rgba(225,0,0,0.2)");
                        }
                    },
                    function () {
                        // code 2: neutralino could not read the file for verification
                        message("File could not be saved: an error occured. (code: 2)", "rgba(225,0,0,0.2)");
                    }
                );
            },
            function () {
                // code 3: neutralino could not write to the file destination (this error should be very rarely encountered because it'll create a new file regardless)
                message("File could not be saved: an error occured. (code: 3)", "rgba(225,0,0,0.2)");
            }
        );
    } else {
        message("File could not be saved: txt files only. (code: 4)", "rgba(225,0,0,0.2)");
    }
    */
    console.log("saveDesktop triggered");
}