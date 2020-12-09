const base_url = './../media';

// 引数で指定したcookieの値を取得する
function getCookie(name){
    let cookieValue = null;
    const cookies = document.cookie.split(';');
    for(cookie of cookies){
        let trim_cookie = cookie.trim();
        if(trim_cookie.substring(0, name.length+1) === (name + '=')){
            cookieValue = decodeURIComponent(trim_cookie.substring(name.length + 1));
            break;
        }
    }
    return cookieValue;
};

// 入力ファイルが画像ファイルか確認する
function confirmImageExt(filename)
{
    const ext = getExt(filename);
    const imgExt = [
        'jpg','jpeg', 'JPG', 'JPEG', 'jpe', 'jfif', 'pjpeg', 'pjp',
        'png',
        'gif',
        'svg', 'svgz',
        'tif', 'tiff',
        'esp', 
        'pict',
        'bmp', 
        'dib', 
        'ico', 'icons'
    ];
    if(imgExt.indexOf(ext) === -1){
        alert(`${filename}は画像ではありません.`);
        return false;
    }else{
        return true;
    }
};

// 入力ファイルの拡張子を取得する
function getExt(filename)
{
    const pos = filename.lastIndexOf('.');
    if(pos === 1){
        return ''
    }
    return filename.slice(pos + 1);
};

function getId(id){
    return id.split('_')[1];
};