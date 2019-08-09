let diceCanvas = {
    scale: 1,
    chipsImgObj: null, //筹码图片对象
    flyState: 'flyTo', //默认飞出去
    ctxFly: null, //画筹码飞的画笔
    ctxStop: null, //画筹码停止的画笔
    ctxBetted: null, //画确认投注筹码的画笔
    eachBetCount: {}, //容器，key为code，value为选号总投注金额
    priceNum: 10, //默认所用面额的筹码
    betOrderRecords: {}, //记录投注过的method，price，code,amount汇总
    betForRecords: [], //记录每次点击投注的相关数据，初始坐标，priceNum等 取消投注翻倍投注用的到
    bettedRecords: [], //确认投注的记录
    pricePos: { //chips图片上每个筹码图片对应的位置
        1: [0, 0],
        5: [166, 0],
        10: [166 * 2, 0],
        20: [166 * 3, 0],
        50: [166 * 4, 0],
        100: [166 * 5, 0],
        1000: [166 * 6, 0],
        5000: [166 * 7, 0],
    },
    stopOffset() {
        return {
            1: -8 * this.scale,
            5: -6 * this.scale,
            10: -4 * this.scale,
            20: -2 * this.scale,
            50: 0 * this.scale,
            100: 2 * this.scale,
            1000: 4 * this.scale,
            5000: 6 * this.scale,
        };
    },
    init() {
        let _this = this;
        _this.loadImage();
        _this.scale = screen.width < 1500 ? screen.width / 1920 : 1;
        let scale = _this.scale;
        //拿到画布
        let canvas_fly = document.getElementById('canvas_fly'); //渲染飞出去的筹码
        canvas_fly.width = document.body.clientWidth;
        canvas_fly.height = 912 * scale || 800;
        _this.ctxFly = canvas_fly.getContext('2d');
        let canvas_stop = document.getElementById('canvas_stop'); //渲染未确认投注放桌面上的筹码
        canvas_stop.width = document.body.clientWidth;
        canvas_stop.height = 912 * scale || 800;
        _this.ctxStop = canvas_stop.getContext('2d');
        let canvas_betted = document.getElementById('canvas_betted'); //渲染确认投注的筹码
        canvas_betted.width = document.body.clientWidth;
        canvas_betted.height = 912 * scale || 800;
        _this.ctxBetted = canvas_betted.getContext('2d');

        //拿到chipsImgObj对象
        let img = new Image();
        img.onload = function () {
            _this.chipsImgObj = this; //拿到chipsImgObj对象
        }
        img.src = './images/chips.png';

        //确定所用筹码
        $('.chips>.chip').off('click').on('click', function (e) {
            $(this).addClass('on').siblings('.chip').removeClass('on');
            _this.priceNum = +$(this).attr('priceNum');
        });
        $('.chips>.chip10').trigger('click'); //默认筹码10

        let pieceIntervalOver = { //连续点击翻倍生不生效的flag
            'betFor': false,
            'betted': false,
            'pieceCount': 0,
        };
        let cancelOk = {
            ok: false,
            count: 0,
        }; //取消完毕，默认false
        //点击桌面选号
        $('[rel="selectCode"]').off('click').on('click', function (e) {
            if (cancelOk.ok || cancelOk.count === 0) {
                cancelOk.count = 0;
            } else {
                return; //没取消完毕不准过去
            }

            _this.flyState = 'flyTo';
            let code = $(this).attr('value');
            let method = $(this).attr('method');
            let startPos = {
                x: $(`.chips .chip${_this.priceNum}`).offset().left,
                y: $(`.chips .chip${_this.priceNum}`).offset().top,
            };
            let endPos = {
                x: $(this).offset().left + $(this)[0].offsetWidth * scale / 2 - $('.chips>.chip').width() * scale / 2,
                y: $(this).offset().top + $(this)[0].offsetHeight * scale / 2 - $('.chips>.chip').height() * scale / 2,
            };
            _this.eachBetCount[code] = _this.eachBetCount[code] || 0;
            _this.eachBetCount[code] += _this.priceNum;
            _this.betOrderRecords[code] = { //记录order
                method: method,
                code: code,
                price: _this.priceNum,
                amount: _this.eachBetCount[code],
                piece: _this.eachBetCount[code],
            };
            let clickedElemOption = { //被点击元素的相关数据
                priceNum: _this.priceNum,
                code: code,
                position: {
                    x: $(this).offset().left,
                    y: $(this).offset().top,
                },
                width: $(this).outerWidth(),
                height: $(this).outerHeight(),
            };
            _this.betForRecords.push({ //记录投注
                elemOption: copyJSON(clickedElemOption),
                priceNum: _this.priceNum,
                startPos,
                endPos,
            });

            _this.chipFly(_this.ctxFly, _this.ctxStop, _this.chipsImgObj, _this.priceNum, startPos, endPos, clickedElemOption, 10);
            $('.betMoneyAmount').text(_this.calculateBetMoney());
        });
        //取消投注
        $('.cancelButton').off('click').on('click', function (e) {
            if (cancelOk.ok || cancelOk.count === 0) {
                cancelOk.ok = false;
            } else {
                return; //没取消完毕不准过去
            }
            if ((pieceIntervalOver.betFor && pieceIntervalOver.betted) || pieceIntervalOver.pieceCount === 0) {

            } else {
                return; //上次翻倍全部渲染结束才能进行下一次点击操作，没结束操作无效                
            }
            cancelOk.count += 1;

            pieceIntervalOver.pieceCount = 0;
            if (_this.betForRecords.length === 0) {
                return;
            }
            _this.flyState = 'flyBack';
            //timechunk 分时函数
            let i = 0;
            let interval = setInterval(() => {
                if (i === _this.betForRecords.length) {
                    cancelOk.ok = true;
                    cancelOk.count = 0; //回到0
                    _this.betForRecords.length = 0;
                    _this.betOrderRecords = {};
                    _this.eachBetCount = {};
                    _this.ctxStop.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
                    $('.betMoneyAmount').text(_this.calculateBetMoney());
                    return clearInterval(interval);
                }
                let record = _this.betForRecords[i];
                _this.chipFly(_this.ctxFly, _this.ctxStop, _this.chipsImgObj, record.priceNum, record.endPos, record.startPos, record.elemOption, 10);
                i++;
            }, 10);
        });
        //确认投注
        $('.betButton').off('click').on('click', function (e) {
            if (_this.betForRecords.length === 0) {
                alert('请先下注！');
                return;
            }
            if (cancelOk.ok || cancelOk.count === 0) {} else {
                return; //没取消完毕不准过去
            }
            if ((pieceIntervalOver.betFor && pieceIntervalOver.betted) || pieceIntervalOver.pieceCount === 0) {

            } else {
                return; //上次翻倍全部渲染结束才能进行下一次点击操作，没结束操作无效                
            }
            _this.flyState = 'betted';
            _this.bettedRecords = _this.bettedRecords.concat(_this.betForRecords);
            _this.betForRecords.forEach((record) => {
                _this.chipFly(_this.ctxFly, _this.ctxBetted, _this.chipsImgObj, record.priceNum, record.endPos, record.endPos, record.elemOption, 30);
            });
            _this.ctxStop.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
            _this.betForRecords.length = 0;
            _this.betOrderRecords = {};
            _this.eachBetCount = {};
        });
        //翻倍投注 
        $('.pieceButtoon').off('click').on('click', function (e) {
            let bettedLen = _this.bettedRecords.length;
            let betForLen = _this.betForRecords.length;
            if (bettedLen === 0 && betForLen === 0) {
                return;
            }
            if (cancelOk.ok || cancelOk.count === 0) {} else {
                return; //没取消完毕不准过去
            }
            if ((pieceIntervalOver.betFor && pieceIntervalOver.betted) || pieceIntervalOver.pieceCount === 0) {
                pieceIntervalOver.betFor = false;
                pieceIntervalOver.betted = false;
                pieceIntervalOver.pieceCount += 1;
            } else {
                return; //上次翻倍全部渲染结束才能进行下一次点击操作，没结束操作无效                
            }

            //timechunk分时函数，防止短时间多次触发卡死浏览器
            let i = 0;
            let interval_bet = setInterval(() => {
                if (i === bettedLen) {
                    pieceIntervalOver.betted = true;
                    return clearInterval(interval_bet);
                }
                let code = _this.bettedRecords[i]['elemOption']['code'];
                _this.priceNum = _this.bettedRecords[i]['priceNum'];
                $(`[rel="selectCode"][value="${code}"]`).trigger('click'); //自动桌面选号点击
                i++;
            }, 10);
            let j = 0;
            let interval_betted = setInterval(() => {
                if (j === betForLen) {
                    pieceIntervalOver.betFor = true;
                    return clearInterval(interval_betted);
                }
                let code = _this.betForRecords[j]['elemOption']['code'];
                _this.priceNum = _this.betForRecords[j]['priceNum'];
                $(`[rel="selectCode"][value="${code}"]`).trigger('click'); //自动桌面选号点击
                j++;
            }, 10);
        });
    },
    loadImage() { //加载进度条
        let _this = this;
        $('canvas.loadBarContent')[0].width = 400;
        $('canvas.loadBarContent')[0].height = 100;

        let imagePaths = [
            '/static/images/diceGameBg.png',
            '/static/images/desktop.png',
            '/static/images/nameLogo.svg',
            '/static/images/balance.svg',
            '/static/images/betMoney.png',
            '/static/images/chips.png',
            '/static/images/diceCountDown.png',
            '/static/images/diceCountDownNum.png',
            '/static/images/diceResultDetail.png',
            '/static/images/diceResultDetail_ten.png',
            '/static/images/dice.svg',
            '/static/images/dice_small.svg',
            '/static/images/diceLight.png',
            '/static/images/diceCup.png',
            '/static/images/saizi_1.png',
            '/static/images/saizi_2.png',
            '/static/images/saizi_3.png',
            '/static/images/saizi_4.png',
            '/static/images/saizi_5.png',
            '/static/images/saizi_6.png',
        ];
        let loadedImgs = [];
        let loader = new lightLoader($('canvas.loadBarContent')[0], 400, 100, loadedImgs, imagePaths);
        loader.init();
        imagePaths.forEach((path) => {
            let img = new Image();
            img.onload = function () {
                loadedImgs.push(path);
                if (loadedImgs.length === imagePaths.length) {
                    _this.selfAdaption(); //自适应
                    $('.loadBar').fadeOut().remove();
                }
            };
            img.src = path;
        });

    },
    selfAdaption() {
        let _this = this;
        //屏幕自适应

        let diceGameContent = $('.diceGameContent');
        /*  diceGameContent.css({
             'width': document.body.clientWidth * _this.scale,
         }); */
        $('body').css({
            'height': 912 * _this.scale,
        });
        diceGameContent.css({
            'transform': `scale(${_this.scale})`,
            'transform-origin': 'center top',
        });

    },
    /**
     * 创建飞盘飞出的函数
     * 
     * @param {object} ctx  canvas画笔
     * @param {object} img  画的图片对象
     * @param {object} startPos 开始坐标
     * @param {object} endPos 结束坐标
     * @param {object} clickedElemOption 被点击选号的数据{code,width,heiget,position}
     * @param {number} duration 动画持续时间 ms单位
     */
    chipFly(ctxFly, ctxEnd, img, priceNum, startPos, endPos, clickedElemOption, duration) {
        let _this = this;
        let startTime = new Date().getTime();
        let X = startPos['x'];
        let Y = startPos['y'];
        let speedX = (endPos['x'] - startPos['x']) / duration;
        let speedY = (endPos['y'] - startPos['y']) / duration;
        let animation = null;

        function _chipFly() {

            ctxFly.clearRect(X, Y, 42, 42);
            X += speedX;
            Y += speedY;
            if ((speedX <= 0 && X <= endPos['x']) || (speedX >= 0 && X >= endPos['x'])) { //判断停止的条件，坐标超过目标坐标就停
                ctxFly.clearRect(X, Y, 42, 42);
                cancelAnimationFrame(animation);
                //换另一只画笔来画落地筹码，防止别的筹码经过这里的时候把这个筹码清除
                if (_this.flyState === 'flyTo' || _this.flyState === 'betted') { //如果是飞出去的会重新计算筹码渲染,飞回来的就直接消失不进入这个逻辑
                    let code = clickedElemOption['code'];
                    let priceCountObj = _this.calculateIcon(_this.eachBetCount[code]);
                    ctxEnd.clearRect(clickedElemOption['position']['x'], clickedElemOption['position']['y'], clickedElemOption['width'], clickedElemOption['height']); //先清除之前画的
                    _this.chipEnd(ctxEnd, img, priceCountObj, endPos, clickedElemOption);
                }

                return;
            }

            ctxFly.drawImage(img, ..._this.pricePos[priceNum], 120, 120, X, Y, 42 * _this.scale, 42 * _this.scale);

            animation = requestAnimationFrame(_chipFly);
        }
        _chipFly();
    },
    /**
     * 
     * 
     * @param {object} ctxStop 画笔
     * @param {object} img 
     * @param {object} priceCountObj 每个筹码的个数{1:2,5:10,10:1,...,5000:1}
     * @param {object} endPos 坐标
     */
    chipEnd(ctxEnd, img, priceCountObj, endPos, clickedElemOption) { //最终渲染位置
        let _this = this;
        //不同面额筹码位置错开
        for (let priceNum in priceCountObj) {
            //timechunk 分时处理防止卡死浏览器
            let i = 0;
            let interval = setInterval(() => {
                if (i === priceCountObj[priceNum]) {
                    return clearInterval(interval);
                }
                let x = endPos['x'];
                let y = endPos['y'] + _this.stopOffset()[priceNum] - i * 2;
                y = y > clickedElemOption['position']['y'] ? y : clickedElemOption['position']['y'];
                ctxEnd.globalCompositeOperation = "destination-over";
                if (_this.flyState === 'betted') { //确认投注过的加个描边
                    ctxEnd.save();
                    ctxEnd.beginPath();
                    ctxEnd.lineWidth = 1;
                    ctxEnd.strokeStyle = "purple";
                    ctxEnd.arc(x + 21 * _this.scale, y + 21 * _this.scale, 22 * _this.scale, 0, 360);
                    ctxEnd.stroke();
                    ctxEnd.restore();
                }

                ctxEnd.drawImage(img, ..._this.pricePos[priceNum], 120, 120, x, y, 42 * _this.scale, 42 * _this.scale);
                i++;
            }, 10);
        }
    },
    /* 计算筹码图标，各种面额硬币并非实体，只有1元这个计量单位。然后每次投钱或者去掉钱，自动把分换算成相应图标。 */
    calculateIcon(count) { //count 1元钱的个数,chipTypes = [1,5,10,20,50,100,1000,5000]
        //5k筹码的个数
        let result = {};
        result[5000] = Math.floor(count / 5000);
        result[1000] = Math.floor((count - result[5000] * 5000) / 1000);
        result[100] = Math.floor((count - result[5000] * 5000 - result[1000] * 1000) / 100);
        result[50] = Math.floor((count - result[5000] * 5000 - result[1000] * 1000 - result[100] * 100) / 50);
        result[20] = Math.floor((count - result[5000] * 5000 - result[1000] * 1000 - result[100] * 100 - result[50] * 50) / 20);
        result[10] = Math.floor((count - result[5000] * 5000 - result[1000] * 1000 - result[100] * 100 - result[50] * 50 - result[20] * 20) / 10);
        result[5] = Math.floor((count - result[5000] * 5000 - result[1000] * 1000 - result[100] * 100 - result[50] * 50 - result[20] * 20 - result[10] * 10) / 5);
        result[1] = Math.floor(count - result[5000] * 5000 - result[1000] * 1000 - result[100] * 100 - result[50] * 50 - result[20] * 20 - result[10] * 10 - result[5] * 5);
        return result;
    },
    calculateBetMoney() { //计算下注金额
        let _this = this;
        let result = 0;
        for (let code in _this.eachBetCount) {
            result += _this.eachBetCount[code];
        }
        return result;
    },
};
diceCanvas.init();

function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}
