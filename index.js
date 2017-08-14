let fs = require('fs');
let path = require('path');


let str = `
/**
    * @title 测试控制器
    * @type get
    * @param id int 1
    * @param name string ''
    * @return {}
    * @remark 这是测试专用的控制器
**/

var reg = /^(\s{4}|\t)\*\s@(title|type|param|return|remark)\s.*?$/mg;


/**
    * @title 测试控制器01
    * @type get
    * @param id int 1
    * @param name string ''
    * @return {}
    * @remark 这是测试专用的控制器
**/



`;



var reg = /(^\t\*\s@(title|type|param|return|remark)\s([\S]*?)(\s|[\n\s\t$])(int|string|object|array|function|number|boolean)?(\s|[$\n\s\t]))/mg;

let setValue = (result, key, value) => {
    switch (key) {
        case 'title':
        case 'type':
        case 'return':
        case 'remark':
            result[key] = value[2];
            break;
        case 'param':
            let obj = {};
            value[2] && (obj['keyname'] = value[2]);
            value[3] && (obj['type'] = value[3]);
            value[4] && (obj['defaultValue'] = value[4]);
            if (result[key]) {
                result[key].push(obj);
            } else {
                result[key] = [obj];
            }
            break;
    }
}

let createData = (str) => {
    let mask = /\/\*\*[\s\S]+?([\n\t]\*\*\/)/g;
    let probject = str.match(mask);
    let reg = /^(\s{4}|\t)\*\s@(title|type|param|return|remark)\s.*?$/mg;
    let data = [];
    probject && probject.forEach((str) => {
        let arr = str.match(reg);
        let result = {};
        arr && arr.forEach((str) => {
            let obj = str.match(/@(title|type|param|return|remark)(\s[\S]+)?(\s[\S]+)?(\s[\S]+)?$/);
            setValue(result, obj[1], obj);
        })
        if (Object.keys(result).length) {
            data.push(result);
        }
    })
    return data;
}

let getFileType = (path) => {
    $data = path.match(/^.*?.([a-zA-Z0-9]+)$/);
    if ($data) {
        return $data[1];
    } else {
        return '';
    }
}

let data = [];
let findSync = (startPath) => {
    let result = [];
    let finder = (_path) => {
        let files = fs.readdirSync(_path);
        files.forEach((val, index) => {
            let fPath = path.join(_path, val);
            let stats = fs.statSync(fPath);
            if (stats.isDirectory()) finder(fPath);
            if (stats.isFile()) {
                let msg = fs.lstatSync(fPath);
                console.log(getFileType(fPath), fPath);
                if (['php', 'js', 'py'].indexOf(getFileType(fPath))) {
                    let str = fs.readFileSync(fPath, 'utf-8');
                    let result = createData(str);
                    if (Object.keys(result).length) {
                        data.push(result);
                    }
                }
            }
        });

    }
    finder(startPath);
}
findSync('./');