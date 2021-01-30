(function ($) {
    $(function () {
        let history          = [];
        let historyIdx       = history.length;
        let documentBody     = document.body;
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

        function clearBuffer() {
            $(".mobile-assistant").val("");
        }

        function syncBuffer() {
            commandBuffer.innerHTML = $(".mobile-assistant").val()  + consoleCaret.outerHTML;
        }

        function processSpecialKeys(keyEvent) {
            const stroke      = keyEvent;

            switch(stroke.key) {
                case "Escape":
                    clearBuffer();
                    break;

                case "ArrowUp":
                    if (historyIdx <= 0) return; 
    
                    historyIdx--;
                    $(".mobile-assistance").val(history[historyIdx]);
    
                    break;
    
                case "ArrowDown":
                    if (historyIdx >= history.length) {
                        clearBuffer();
                    } else {
                        historyIdx++;
    
                        if (historyIdx < history.length)
                            $(".mobile-assistance").val(history[historyIdx]);
                        else
                            $(".mobile-assistance").val("");
                    }
                    break;
                
                default:
                    break;
            }

            syncBuffer();
        }

        function beginCommand(cmd) {
            // this must be refactored
            if (cmd.length === 0 || cmd.startsWith('#')) 
                return;
            else if (cmd === "clear") {
                [...document.querySelectorAll("container > *")]
                    .filter(elem => elem.tagName.toLowerCase() != "command-line")
                    .forEach(elem => elem.remove());
            }
            else if (cmd === "bash") {
                $.get("/banner")
                .done(response => prependStream(response));
            }
            else if (cmd === "profile") {
                $.get("/profile")
                 .done(response => prependStream(response));
            }
            else if (cmd === "help") {
                $.get("/help")
                 .done(response => prependStream(response));
            }
            else if (cmd === "list") {
                $.get("/list")
                 .done(response => prependStream(response));
            }
            else {
                prependStreamLine("bash: command not found :s");
            }

            history.push(cmd);
            historyIdx++;
        }
        
        function restoreCommand() {
            $(commandContainer).removeClass("hide");            

            clearBuffer();
            syncBuffer();
        
            $(".mobile-assistant").focus();
        }

        $(documentBody).on('click', function (e) {    
            $(".mobile-assistant").focus();
        });

        $("form").on('submit', function (e) {
            const preserveStr = commandContainer.innerText;
            const cmdStr      = $(".mobile-assistant").val();

            prependStreamLine(preserveStr.replace("\n", ""));
            $(commandContainer).addClass("hide");

            console.log("[COMMAND] " + cmdStr);

            beginCommand(cmdStr);
            restoreCommand();
            
            e.preventDefault();
        });

        $(".mobile-assistant").on('input', function (e) {
            syncBuffer();
        });

        $(".mobile-assistant").on('keydown', function (e) {
            processSpecialKeys(e.originalEvent);
        });

        $.get("/banner")
         .done(response => {
            prependStream(response);
            restoreCommand();
         });
    });
})(jQuery);