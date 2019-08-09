/* 工具函数 */
define('Utils', function (require) {

    var Utils = {
        chipFly(zr, ImageShape, startPos, endPos) { //创建一个飞盘飞出
            var oImg = new ImageShape({
                style: {
                    sx: 0,
                    sy: 0,
                    sWidth: 120,
                    sHeight: 120,
                    x: 0,
                    y: 0,
                    width: 42,
                    height: 42,
                    image: '/static/images/chips.png',
                },
                position: startPos,
            });
            zr.add(oImg);
           
            oImg.animate('', false).when(200, {
                position: endPos,
            }).start();
        }
    };

    return Utils;

});