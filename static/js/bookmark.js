$(function () {
    const navContent = $("#nav_content");

    function createNavLine() {
        let line = document.createElement("div");
        line.className = "nav-line";
        return line;
    }

    function createNavBlock(info) {
        let lines = []
        {
            for (let link of info.links) {
                lines.push(
                    `<li><a href="${link.href}" class="jj-list-link ${link._class}" target="_blank">${link.title}</a></li>`
                );
            }
        }
        return `<div class="jj-list">
                    <div class="jj-list-tit">${info.title}</div>
                    <ul class="jj-list-con">
                        ${lines.join("\n")}
                    </ul>
                </div>`
    }

    $.get("/static/data/bookmark.json", function (json) {
        if (json && json.code === 0 && json.data) {
            let num = 0;
            let line = createNavLine();
            for (let group of json.data) {
                if (group.title) {
                    line.innerHTML += createNavBlock(group)
                }
                if (++num % 3 === 0) {
                    navContent.append(line);
                    line = createNavLine();
                }
            }
            navContent.append(line);
        }
    })
})