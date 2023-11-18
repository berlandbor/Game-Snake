/*
	Code by Gaetano Bonofiglio
	https://github.com/Kidel/
	MIT License
*/

// Получаем элемент Canvas и его 2D-контекст рисования

var canvas = document.getElementById("snakeCanvas");
var ctx = canvas.getContext("2d");

// Определяем цвета для элементов игры
var FOOD_COLOR = "#23432b";
var BORDER_COLOR = "#23432b";
var TAIL_COLOR = "#54812c";
var STROKE_COLOR = "#d1e890";

// Объект, представляющий рамку игрового поля
var rect = {
    // Задаем размеры рамки, уменьшенные на 20 пикселей
    height: canvas.height - 20,
    width: canvas.width - 20,
    // Устанавливаем цвет границы
    color: BORDER_COLOR,
    // Начальное положение верхнего левого угла рамки
    position: { x: 10, y: 10 },
    
    // Метод для отрисовки границы
    draw: function (canvas, canvasContext) {
        canvasContext.beginPath();

        // Вертикальные линии
        canvasContext.rect(this.position.x - 1, 0, 1, canvas.height);
        canvasContext.rect(canvas.width - this.position.x, 0, 1, canvas.height);

        // Горизонтальные линии
        canvasContext.rect(0, this.position.y - 1, canvas.width, 1);
        canvasContext.rect(0, canvas.height - this.position.y, canvas.width, 1);

        // Заполняем границу цветом
        canvasContext.fillStyle = this.color;
        canvasContext.fill();
        canvasContext.closePath();
    },
    
    // Метод для обновления границы
    update: function (canvas, canvasContext) {
        this.draw(canvas, canvasContext);
    }
};

// Объект, представляющий еду в игре
var food = {
    // Начальная позиция еды
    position: { x: 0, y: 0 },
    // Размеры еды
    height: 10,
    width: 10,
    // Цвет еды
    color: FOOD_COLOR,

    // Метод для отрисовки еды
    draw: function (canvasContext) {
        canvasContext.beginPath();
        // Отрисовка прямоугольника с учетом границы
        canvasContext.rect(this.position.x + 1, this.position.y + 1, this.width - 2, this.height - 2);
        // Установка цвета заполнения
        canvasContext.fillStyle = this.color;
        // Заполнение прямоугольника
        canvasContext.fill();
        canvasContext.closePath();
    },

    // Метод для начальной установки еды на поле
    start: function (canvas, rect) {
        this.newPosition(canvas, rect);
    },

    // Метод для обновления еды (отрисовка)
    update: function (canvas, canvasContext) {
        this.draw(canvasContext);
    },

    // Метод для генерации новой позиции еды
    newPosition: function (canvas, rect) {
        // Генерация новых координат в пределах игрового поля
        var newX = Math.floor(((Math.random() * canvas.width - rect.position.x - this.width)) / 10) * 10 + rect.position.x;
        // Проверка, чтобы не выходить за границы слева
        if (newX < rect.position.x) newX = rect.position.x;
        
        var newY = Math.floor(((Math.random() * canvas.height - rect.position.y - this.height)) / 10) * 10 + rect.position.y;
        // Проверка, чтобы не выходить за границы сверху
        if (newY < rect.position.y) newY = rect.position.y;
        
        // Установка новой позиции еды
        this.position = { x: newX, y: newY };
    }
};

// Функция для обнаружения столкновения змеи с едой
function foodCollisionDetection(head, food) {
    // Проверка, совпадают ли координаты головы змеи с координатами еды
    return (head.position.x === food.position.x) && (head.position.y === food.position.y);
}

function calculateNewDirection(headPosition, mousePosition) {
    // Вычисляем разницу между координатами головы и мыши
    var dx = mousePosition.x - headPosition.x;
    var dy = mousePosition.y - headPosition.y;

    // Определяем, в каком направлении голова змейки ближе к мыши
    if (Math.abs(dx) > Math.abs(dy)) {
        // Двигаемся горизонтально
        return dx > 0 ? "right" : "left";
    } else {
        // Двигаемся вертикально
        return dy > 0 ? "down" : "up";
    }
}
// Объект, представляющий змею в игре
var snake = {
    // Массив сегментов змеи
    bricks: [],
    // Флаг столкновения змеи
    hit: false,
    // Размеры сегментов змеи
    height: 10,
    width: 10,
    // Направление движения змеи
    command: "up",
    // Используемое направление
    using: "up",

    // Метод для управления змеей на основе пользовательского ввода
    control: function (canvas) {
        if (controls.rightPressed && !(this.using == "left")) {
            this.command = "right";
        } else if (controls.leftPressed && !(this.using == "right")) {
            this.command = "left";
        } else if (controls.upPressed && !(this.using == "down")) {
            this.command = "up";
        } else if (controls.downPressed && !(this.using == "up")) {
            this.command = "down";
        }
    },

    // Методы для проверки, вышла ли змея за границы экрана
    isOutOfCanvasLeft: function (canvas) {
        return this.bricks[0].position.x > canvas.width - this.bricks[0].width + canvas.position.x;
    },
    isOutOfCanvasRight: function (canvas) {
        return this.bricks[0].position.x < canvas.position.x;
    },
    isOutOfCanvasTop: function (canvas) {
        return this.bricks[0].position.y < canvas.position.y;
    },
    isOutOfCanvasBottom: function (canvas) {
        return this.bricks[0].position.y > canvas.height - this.bricks[0].height + canvas.position.y;
    },

    // Метод для обнаружения столкновений змеи
    collision: function (canvas) {
        // Проверка на столкновение с собой
        var selfHit = false;
        for (var i = 1; i < this.bricks.length; i++) {
            selfHit = selfHit || (this.bricks[0].position.x == this.bricks[i].position.x && this.bricks[0].position.y == this.bricks[i].position.y);
            if (selfHit) {
                break;
            }
        }
        this.hit = selfHit; //|| this.checkBorderCollision(canvas);
    },
    
   /* checkBorderCollision: function (canvas) {
        return this.isOutOfCanvasLeft(canvas) || this.isOutOfCanvasRight(canvas) ||
               this.isOutOfCanvasTop(canvas) || this.isOutOfCanvasBottom(canvas);
    },*/
    
    // Метод для движения змеи
    move: function () {
        // draw the tail in front of the head
        this.addBrick(this.bricks[0].position);
        this.bricks.pop();
        if (this.command == "right") {
            this.using = this.command;
            this.updatePosition(this.width, 0);
        } else if (this.command == "left") {
            this.using = this.command;
            this.updatePosition(-this.width, 0);
        } else if (this.command == "down") {
            this.using = this.command;
            this.updatePosition(0, this.height);
        } else if (this.command == "up") {
            this.using = this.command;
            this.updatePosition(0, -this.height);
        }
    },
    
    updatePosition: function (dx, dy) {
        this.bricks[0].position = {
            x: (this.bricks[0].position.x + dx + canvas.width) % canvas.width,
            y: (this.bricks[0].position.y + dy + canvas.height) % canvas.height
        };
    },
    

    // Метод для начальной установки змеи
    start: function (position) {
        for (var i = 0; i < 3; i++)
            this.addBrick({ x: position.x, y: position.y - (i * this.width) });
    },

    // Метод для обновления змеи
    update: function (canvas, canvasContext, rect) {
        this.move();
        // Обновление каждого сегмента змеи
        for (var i = 0; i < this.bricks.length; i++) {
            this.bricks[i].update(canvasContext);
        }
        // Проверка столкновений
        this.collision(rect);
    },

    // Метод для обновления змеи в реальном времени (управление)
    realTimeUpdate: function (canvas) {
        this.control(canvas);
    },

    // Метод для добавления нового сегмента змеи
    addBrick: function (position, tail) {
        // Создание нового сегмента змеи
        var b = {
            height: 10,
            width: 10,
            position: position,
            color: TAIL_COLOR,
            canBeDestroyed: false,
            // Метод для отрисовки сегмента змеи
            draw: function (canvasContext) {
                canvasContext.beginPath();
                canvasContext.rect(this.position.x + 1, this.position.y + 1, this.width - 2, this.height - 2);
                canvasContext.fillStyle = this.color;
                canvasContext.fill();
                canvasContext.closePath();
            },
            // Метод для начальной установки сегмента змеи
            start: function (position) {
                this.position = position;
            },
            // Метод для обновления сегмента змеи
            update: function (canvasContext) {
                this.draw(canvasContext);
            }
        };
        // Добавление сегмента в начало массива (голова) или в конец (хвост)
        if (tail) {
            this.bricks.push(b);
        } else {
            this.bricks.unshift(b);
        }
    },
    
    isOutOfCanvasLeft: function (canvas) {
        return this.bricks[0].position.x < 0;
    },
    
    isOutOfCanvasRight: function (canvas) {
        return this.bricks[0].position.x >= canvas.width;
    },
    
    isOutOfCanvasTop: function (canvas) {
        return this.bricks[0].position.y < 0;
    },
    
    isOutOfCanvasBottom: function (canvas) {
        return this.bricks[0].position.y >= canvas.height;
    },
    
  // Новые свойства для хранения координат мыши
  mouseX: 0,
  mouseY: 0,

  // Новый метод для обработки движения мыши
  handleMouseMovement: function (event) {
      var rect = canvas.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;

      // Проверяем, что у змейки есть массив bricks и он не пустой
     if (this.bricks && this.bricks.length > 0 && this.bricks[0].position) {
          // Здесь вы можете добавить логику для изменения направления змейки в зависимости от положения мыши
          this.command = calculateNewDirection(this.bricks[0].position, { x: this.mouseX, y: this.mouseY });
      }
  }
};

var canvas = document.getElementById("snakeCanvas");
canvas.addEventListener("mousemove", function (event) {
  snake.handleMouseMovement(event);
});

// Ваш существующий код

// Добавление слушателей событий касания
canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);

// Переменные для хранения координат касания
var startX, startY, endX, endY;

// Функция для обработки начала касания
function handleTouchStart(event) {
    // Получение координат начального касания
    var touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
}

// Функция для обработки движения по экрану при касании
function handleTouchMove(event) {
    // Предотвращение стандартного поведения браузера при касании
    event.preventDefault();

    // Получение координат текущего положения прикосновения
    var touch = event.touches[0];
    endX = touch.clientX;
    endY = touch.clientY;

    // Определение направления свайпа и передача команды змее
    calculateSwipeDirection();
}

// Функция для определения направления свайпа и передачи команды змее
function calculateSwipeDirection() {
    // Определение разницы между начальными и конечными координатами
    var deltaX = endX - startX;
    var deltaY = endY - startY;

    // Определение направления свайпа по большей разнице по координате
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Горизонтальное движение
        if (deltaX > 0 && !(snake.using === "left")) {
            snake.command = "right";
        } else if (deltaX < 0 && !(snake.using === "right")) {
            snake.command = "left";
        }
    } else {
        // Вертикальное движение
        if (deltaY > 0 && !(snake.using === "up")) {
            snake.command = "down";
        } else if (deltaY < 0 && !(snake.using === "down")) {
            snake.command = "up";
        }
    }
}

// Получение ссылок на HTML-элементы кнопок
/*var btnUp = document.getElementById("btnUp");
var btnDown = document.getElementById("btnDown");
var btnLeft = document.getElementById("btnLeft");
var btnRight = document.getElementById("btnRight");

// Добавление обработчиков событий для кнопок
btnUp.addEventListener("click", function() {
    snake.command = "up";
});

btnDown.addEventListener("click", function() {
    snake.command = "down";
});

btnLeft.addEventListener("click", function() {
    snake.command = "left";
});

btnRight.addEventListener("click", function() {
    snake.command = "right";
});*/
// Ваш существующий код
// Объект `game` управляет состоянием и событиями игры.

var game = {
    stop: false,          // Флаг, указывающий, завершена ли игра.
    alertShown: false,    // Флаг, указывающий, было ли показано всплывающее окно.

    // Проверяет, завершилась ли игра из-за столкновения с собой (проигрыш).
    isGameOver: function (snake) {
        return snake.hit;
    },

    // Проверяет, выиграна ли игра (заполнены все блоки в пределах рамки).
    isGameWon: function (bricks, rect) {
        return bricks.length >= rect.height * rect.width;
    },

    // Выводит сообщение о проигрыше и выполняет соответствующие действия.
    gameOver: function () {
        if (!this.alertShown) {
            writeText("GAME OVER");     // Выводит текст "GAME OVER".
            writeSubText("click to reload");  // Выводит дополнительный текст.
            playSound('gameover');       // Проигрывает звук "gameover".
        }
        this.alertShown = true;  // Устанавливает флаг, чтобы избежать повторного отображения окна.
    },

    // Выводит сообщение о выигрыше и выполняет соответствующие действия.
    gameWon: function () {
        if (!this.alertShown) {
            writeText("YOU WON");       // Выводит текст "YOU WON".
            writeSubText("click to reload");  // Выводит дополнительный текст.
            playSound('win');           // Проигрывает звук "win".
        }
        this.alertShown = true;  // Устанавливает флаг, чтобы избежать повторного отображения окна.
    },

    // Обновляет состояние игры, проверяя условия проигрыша и выигрыша.
    update: function (snake, bricks, rect) {
        if (this.isGameOver(snake)) {
            this.gameOver();     // Если игра проиграна, вызывает метод для обработки проигрыша.
            this.stop = true;    // Устанавливает флаг, чтобы прекратить обновление игры.
        } else if (this.isGameWon(bricks, rect)) {
            this.gameWon();      // Если игра выиграна, вызывает метод для обработки выигрыша.
            this.stop = true;    // Устанавливает флаг, чтобы прекратить обновление игры.
        }
    }
}

// Функция `start` и функции обновления и перезагрузки игры.

// Инициализация начального состояния игры.
function start() {
    food.start(canvas, rect);  // Устанавливает начальное положение еды.
    snake.start({              // Инициализирует начальное положение змеи.
        x: Math.floor(((canvas.width - snake.width) / 2) / 10) * 10,
        y: Math.floor(canvas.height / 10) * 10 - snake.height - 10
    });
    food.physics = snake.bricks;  // Устанавливает физическую связь между змеей и едой.
    canvas.addEventListener("mousemove", snake.handleMouseMovement);

}

var points = 0;  // Переменная для отслеживания очков игрока.

// Функция обновления состояния игры.
function update() {
    if (!game.stop) {
        clearCanvas(canvas, ctx);  // Очищает холст перед каждым обновлением.
        rect.update(canvas, ctx);  // Обновляет состояние рамки.
        snake.update(canvas, ctx, rect);  // Обновляет состояние змеи.
        
        // Проверка столкновения с едой и обработка соответствующих событий.
        if (foodCollisionDetection(snake.bricks[0], food)) {
            playSound('bip');  // Проигрывает звук столкновения с едой.
            food.newPosition(canvas, rect);  // Устанавливает новую позицию еды.
            snake.addBrick(snake.bricks[snake.bricks.length - 1].position, true);  // Увеличивает длину змеи.
            ++points;  // Увеличивает количество очков.
        }
        
        food.update(canvas, ctx);  // Обновляет состояние еды.
        writePoints("POINTS: " + points);  // Выводит количество очков.
        writeTime();  // Выводит текущее время (предположительно).
        game.update(snake, snake.bricks, rect);  // Обновляет состояние игры.
    
        realTimeUpdate();
    }
}

// Функция для обновления состояния змеи в реальном времени.
function realTimeUpdate() {
    snake.realTimeUpdate(canvas);
}

var canvas = document.getElementById("snakeCanvas");
var ctx = canvas.getContext("2d");

// ... (ваш остальной код)

var startButton = document.getElementById("startButton");

// Добавьте обработчик события для кнопки "Start".
startButton.addEventListener("click", function() {
    start();  // Вызывает функцию start при нажатии на кнопку.
    setInterval(update, 200);  // Установка интервала для обновления основной логики игры (скорость).
    setInterval(realTimeUpdate, 10);  // Установка интервала для обновления состояния змеи в реальном времени.
    startButton.style.display = "none";  // Скрыть кнопку "Start" после ее нажатия.

});

function reloadGame() {
    if (game.stop) location.reload();
}
// рестарт
var stopGameButton = document.getElementById("stopGameButton");

stopGameButton.addEventListener("click", reloadGame1);

function reloadGame1() {
    if (!game.stop) {
        game.stop = true;
        location.reload()
    }
}


/*var canvas = document.getElementById("snakeCanvas");

canvas.addEventListener("mousemove", function (event) {
    snake.handleMouseMovement(event);
});

canvas.addEventListener("click", function (event) {
    snake.command = calculateNewDirection(snake.bricks[0].position, { x: event.clientX, y: event.clientY });
});*/

