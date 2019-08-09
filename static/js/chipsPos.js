/* canvas版本，用canvas控制筹码飞出去动画 */
require(
    ['zrender/zrender','ChipsPos','Utils'],
    function (zrender,ChipsPos,Utils) {
        // just init to get a zrender Instance
        var canvas = document.getElementById('canvas');
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight || 800;
        var zr = zrender.init(canvas);
        // zr can be used now!
        var ImageShape = require('zrender/graphic/Image');
        
        $('[rel="selectCode"]').each(function(index,item){
            $(item).off('click').on('click',function(e){
                let startPos = [$('.chips>.chip1').offset().left,$('.chips>.chip1').offset().top];
                let endPos = [$(this).offset().left,$(this).offset().top];
                console.log(startPos,endPos);
                Utils.chipFly(zr, ImageShape, startPos, endPos);
            });
        });
  
    }
);

/* 底部点击筹码的坐标 */
define('ChipsPos',function (require) {
    let chipsPos = {};
    let chipNums = [];
    $('.chips .chip').each(function (index, chip) {
        chipNums.push($(chip).attr('priceNum'));
    });
    chipNums.forEach(function (num) {
        chipsPos[num] = [
            $(`.chips .chip${num}`).offset().left,
            $(`.chips .chip${num}`).offset().top
        ];
    });

    return chipsPos;
});
