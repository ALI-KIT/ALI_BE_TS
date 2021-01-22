import vntk from "vntk"

var ner = vntk.ner();

var text = "Ông Nguyễn Thiên Nhân chia sẻ về ý nghĩa việc thành lập TP Thủ Đức, để tạo bước đột phá, đưa Thủ Đức phát triển, trở thành TP trí tuệ nhân tạo, công nghệ cao, đáng sống nhất Việt Nam .";
var n : {name: string, type: string}[] = [];
var result = ner.tag(text);
if(Array.isArray(result) ) {
    result.forEach(r => {
        if(r[1].indexOf("N") != -1 || r[1].indexOf("n") != -1) {
            n.push({name: r[0], type: r[1]})
        }
    })
}

console.log(result);