const Dots = (function () {
    class Dots {
        constructor(offsetX, offsetY, num) {
            this.x = offsetX;
            this.y = offsetY;
            this.num = num;
            this.elSting = `<div class="circle" style="top:${offsetY - 11}px;left:${offsetX - 11}px"><span class="dot" /></div>`;
        }

        move (dot, pageX, pageY) {
            dot.style.left = pageX - dot.offsetWidth + 'px';
            dot.style.top = pageY - dot.offsetHeight + 'px';

            this.x = pageX - dot.offsetWidth + 11;
            this.y = pageY - dot.offsetHeight + 11;

            Render.renderCoordintes(this.x, this.y, this.num);
        }

        onMouseDown () {
            this.wasCaptured = true;
        }

        onMouseUp () {
            this.wasCaptured = false;
        }

        onMouseMove () {
            this.wasCaptured && this.move(event.target, event.pageX, event.pageY);
        }

        setDragPoint (dot) {
            dot.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            dot.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            document.querySelector('.draw-section').addEventListener('mouseup', this.onMouseUp.bind(this), false);
            this.dot = dot;
        }
    }

    return Dots;
})();

const MathLogic = (function () {

    const Pi = 3.14;

    const getCenterDot = (dot1, dot3) => {
        const x = (dot1.x + dot3.x) / 2;
        const y = (dot1.y + dot3.y) / 2;

        return new Dots(x, y, 4);
    };

    const getFourthDot = (dot2, dotE) => {
        const x = 2 * dotE.x - dot2.x;
        const y = 2 * dotE.y - dot2.y;

        return new Dots(x, y, 3);
    };

    const getRadiusCircle = (area) => (Math.sqrt(area / Pi));

    const getAreaParallelogram = (dots) => {
        const dotsAr = dots.map(({x, y}) => [x, y]);
        const resX = dotsAr.reduce((acc, cur, id, arr) => {
            if (id === 1) acc = 0;
            return acc + arr[id - 1][0] * cur[1];
        });
        const resY = dotsAr.reduce((acc, cur, id, arr) => {
            if (id === 1) acc = 0;
            return acc + arr[id - 1][1] * cur[0];
        });

        return Math.abs(resX - resY);
    }

    return {
        getCenterDot,
        getFourthDot,
        getRadiusCircle,
        getAreaParallelogram,
    };
})();

const Render = (function () {

    const drawSection = document.querySelector('.draw-section');
    const coordinates = document.querySelector('.coordinates');

    const renderParallelogram = (dots) => {
        const parallelogram = `<svg height="800" width="1000" style="stroke:rgb(0,0,255);stroke-width:1">
       <line x1=${dots[0].x} y1=${dots[0].y} x2=${dots[1].x} y2=${dots[1].y} \/>
       <line x1=${dots[1].x} y1=${dots[1].y} x2=${dots[2].x} y2=${dots[2].y} \/>
       <line x1=${dots[2].x} y1=${dots[2].y} x2=${dots[3].x} y2=${dots[3].y} \/>
       <line x1=${dots[3].x} y1=${dots[3].y} x2=${dots[0].x} y2=${dots[0].y} \/></svg>`;

        drawSection.insertAdjacentHTML('afterbegin', parallelogram);

        return MathLogic.getAreaParallelogram(dots);
    };

    const renderDots = (dot, className) => {
        const element = className ? `<span class="${className}">${dot.elSting}</span>` : dot.elSting;
        drawSection.insertAdjacentHTML('afterbegin', element);
    };

    const renderCenterMassCircle = (centerDot, circleRadius) => {
        const circle = `<div class="yellow-circle temporary"
                         style="top:${centerDot.y - circleRadius/2}px;
                         left:${centerDot.x - circleRadius/2}px;
                         width:${circleRadius}px; height:${circleRadius}px">
                      </div>`;
        drawSection.insertAdjacentHTML('afterbegin', circle);
    };

    const renderCoordintes = (x, y, num) => {
        const changedCoordinatesDiv = document.querySelectorAll('.coordinates div')[num];
        changedCoordinatesDiv.innerHTML = `Кординати точки: ${num + 1}: [${x}, ${y}]`;
    };

    const renderShapesData = (areaParallelogram, circleRadius) => {
        const element = `<div class="temporary">Площа паралелограма: ${areaParallelogram}</div>
                      <div class="temporary">Радіус кола: ${circleRadius}</div>`;
        coordinates.insertAdjacentHTML('afterend', element);
    }

    const renderData = (dotsArray) => {
        const centerDot = MathLogic.getCenterDot(dotsArray[0], dotsArray[2]);
        const fourthDot = MathLogic.getFourthDot(dotsArray[1], centerDot);
        if (dotsArray.length === 4) {
            dotsArray[3] = fourthDot;
            document.querySelectorAll('.temporary').forEach((el) => el.remove());
        } else {
            dotsArray.push(fourthDot);
        }
        renderDots(centerDot, 'temporary');
        renderDots(fourthDot, 'temporary');

        const areaParallelogram = renderParallelogram(dotsArray);
        const circleRadius = MathLogic.getRadiusCircle(areaParallelogram);
        renderShapesData(areaParallelogram, circleRadius);
        renderCenterMassCircle(centerDot, circleRadius);
    };

    return {
        renderDots,
        renderData,
        renderCoordintes,
        renderParallelogram,
        renderCenterMassCircle,
    };
})();

(function () {
    let dotsArray = [];
    const drawSection = document.querySelector('.draw-section');
    const resetButton = document.querySelector('.reset-button');
    const aboutButton = document.querySelector('.about-section');
    const coordinates = document.querySelectorAll('.coordinates div');

    const onResetButtonClick = () => {
        dotsArray.forEach(dot => {
            delete dot.x; delete dot.y; delete dot.elSting; dot = null;
        });
        dotsArray = [];
        drawSection.innerHTML = '';
        coordinates.forEach(div => div.innerHTML = '');
        document.querySelectorAll('.temporary').forEach((el) => el.remove());
    };

    const onAboutButtonClick = () => {
        alert ("Користувач вибирає три довільні точки в клієнтській області браузера. Коли вони вибрані, програма виділяє їх розташування, будуючи червоні кола для кожної вибраної точки. Діаметр кола становить 11 пікселів.\n" +
            "\n" +
            "На основі цих трьох точок будує дві фігури:\n" +
            "синій паралелограм, з трьома вершинами в обраних точках\n" +
            "жовте коло, з такою ж площею та центром маси, які має паралелограм.\n" +
            "\n" +
            "Ці фігури є заповнені.\n" +
            "Координати виділених точок, а також площа паралелограма та кола повинні бути представлені користувачеві чисельно.\n" +
            "\n" +
            "Користувач повинен вільно переміщати точки в області екрану в будь-який час. Переміщення точок змінює відповідно зображення паралелограма і кола та відображає оновлені фігури.");
    };

    const onUserClick = (ev) => {
        if (dotsArray.length < 3) {
            let dot = new Dots(ev.offsetX, ev.offsetY, dotsArray.length);
            Render.renderDots(dot);
            Render.renderCoordintes(ev.offsetX, ev.offsetY, dotsArray.length);
            dot.setDragPoint(document.querySelector('div.circle'));
            dotsArray.push(dot);
        } else {
            Render.renderData(dotsArray);
        }
    };

    drawSection.addEventListener('click', onUserClick, false);
    resetButton.addEventListener('click', onResetButtonClick, false);
    aboutButton.addEventListener('click',onAboutButtonClick, false);

})();