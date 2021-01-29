(function ($) {
    $(function () {
        let inputMode        = true;
        let buffer           = [];
        let history          = [];
        let historyIdx       = history.length;
        let documentBody     = document.querySelector("body");
        let commandContainer = document.querySelector("command-line");
        let commandBuffer    = document.querySelector("buffer");
        let consoleCaret     = document.querySelector("caret");

        function prependStream(stream) {
            $(commandContainer).before(stream);
        }

        function prependStreamLine(stream) {
            stream.trim()
                  .split("\n")
                  .forEach(line => 
                    {
                        if (line.length === 0) return;
                        prependStream("<line>" + line.trim() + "</line>");
                    });
        }

        function inputChar(keyEvent) {
            const stroke     = keyEvent.originalEvent;
            const shiftKey   = stroke.shiftKey;
            const controlKey = stroke.controlKey;

            if (controlKey) {
                return;
            }

            switch(stroke.key) {
                case "Backspace":
                    buffer.pop();
                    break;

                case "Enter":
                    const preserveStr = commandContainer.innerText.slice(0, -1);
                    const cmdStr = buffer.join('').trim();

                    buffer = [];

                    prependStreamLine(preserveStr.replace("\n", ""));
                    $(commandContainer).addClass("hide");

                    beginCommand(cmdStr);
                    restoreCommand();

                    break;

                case "F1":
                case "F2":
                case "F3":
                case "F4":
                case "F5":
                case "F6":
                case "F7":
                case "F8":
                case "F9":
                case "F10":
                case "F11":
                case "F12":
                case "HangulMode":
                case "CapsLock":
                case "ScrollLock":
                case "NumLock":
                case "Insert":
                case "Delete":
                case "Home":
                case "End":
                case "PageUp":
                case "PageDown":
                case "Pause":
                case "ArrowLeft":
                case "ArrowRight":
                case "Shift":
                case "Control":
                case "Alt":
                case "Tab":
                    break;

                case "ArrowUp":
                    if (historyIdx <= 0) return; 

                    historyIdx--;
                    buffer = history[historyIdx].split();

                    break;

                case "ArrowDown":
                    if (historyIdx >= history.length) {
                        buffer = [];
                    } else {
                        historyIdx++;

                        if (historyIdx < history.length)
                            buffer = history[historyIdx].split();
                        else
                            buffer = [];
                    }
                    break;
                
                default:
                    buffer.push(stroke.key);
            }

            commandBuffer.innerHTML = buffer.join('')
                                            .split(' ')
                                            .join("&nbsp;") + "<caret>_</caret>";
        }

        function beginCommand(cmd) {
            if (!inputMode) return;

            inputMode = false;
            console.log("[COMMAND] " + cmd);

            if (cmd === "clear") {
                [...document.querySelectorAll("container > *")]
                    .filter(elem => elem.tagName.toLowerCase() != "command-line")
                    .forEach(elem => elem.remove());
            }
            else if (cmd === "profile") {
                $.get("/profile")
                 .done(response => prependStream(response));
            }
            else if (cmd === "help") {
                $.get("/help")
                 .done(response => prependStream(response));
            }
            else {
                prependStreamLine("bash: command not found :s");
            }

            history.push(cmd);
            historyIdx++;
        }
        
        function restoreCommand() {
            if (inputMode) return;

            $(commandContainer).removeClass("hide");
            inputMode = true;
        }

        $(window).on('focus', function (e) {
            documentBody.focus();
        });

        $(window).on('keydown', function (e) {
            if (e.target.tagName !== documentBody.tagName || 
                !inputMode) return;

            inputChar(e);
        });

        $("container").on('click', function (e) {
            $(".mobile-assistant").click();
        });

        $(".mobile-assistant").on("keydown", function (e) {
            documentBody.dispatchEvent(new KeyboardEvent("keydown", e));
            $(this).val("");
        });

        restoreCommand();
    });
})(jQuery);