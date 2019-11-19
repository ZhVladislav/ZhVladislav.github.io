let loadingWindow = document.querySelector('#preloader');
let restart = false;
let repeatCount = 1;
const SERVER_URL = 'https://www.f1news.ru/';

const UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function UIScene() {
            Phaser.Scene.call(this, {key: 'ui'});
        },

    preload: function () {
        this.load.on('complete', () => {
            loadingWindow.style.display = 'none';
            restart = true;
        });

        this.load.image('snow', 'images/snow.png');
        this.load.image('gas', 'images/gas.png');
        this.load.image('stop', 'images/stop.png');
        this.load.image('logo', 'images/logo.png');
        this.load.image('speedometer', 'images/speedometer.png');
        this.load.image('arrow', 'images/arrow.png');
        this.load.image('popup', 'images/popup.png');
        this.load.image('tire1', 'images/tire1.png');
        this.load.image('tire2', 'images/tire2.png');
        this.load.image('tire3', 'images/tire3.png');
        this.load.image('select', 'images/select.png');
        this.load.image('buttonLetsGo', 'images/buttonLetsGo.png');
        this.load.image('buttonTryAgain', 'images/buttonTryAgain.png');
        this.load.image('buttonRepeat', 'images/buttonRepeat.png');
        this.load.image('buttonSaveResult', 'images/buttonSaveResult.png');
        this.load.image('winPopup', 'images/winPopup.png');
        this.load.image('badResultPopup', 'images/badResultPopup.png');
        this.load.image('losingPopup', 'images/losingPopup.png');
        this.load.spritesheet('trafficLight', 'images/trafficLight.png', {
            frameWidth: 376,
            frameHeight: 163,
            endFrame: 4
        });
    },

    create: function () {
        this.add.image(10, 30, 'logo').setOrigin(0).setScrollFactor(0);
        let self = this;

        this.speedometer = {
            car: game.scene.scenes[0].car,
            arrow: {
                object: null,
                rotationSpeedArrow: -2.05,
                rotate() {
                    this.object.setRotation(this.rotationSpeedArrow)
                }
            },
            increaseSpeed() {
                if (this.arrow.rotationSpeedArrow <= 2.17) {
                    this.arrow.rotationSpeedArrow += this.car.speed / this.car.maxSpeed / (140 / this.car.coefficient);
                }

                if (game.scene.scenes[0].zoomValue >= 0.8 && self.time.timeStart) {
                    game.scene.scenes[0].zoomValue -= this.car.speed / this.car.maxSpeed / (500 / this.car.coefficient);
                }

                this.arrow.rotate();
            },
            decreaseSpeed(coeff = 1) {
                this.arrow.rotationSpeedArrow -= this.car.speed / this.car.maxSpeed / (140 / this.car.decreaseCoeff * coeff);

                if (game.scene.scenes[0].zoomValue <= 1.3 && self.time.timeStart) {
                    game.scene.scenes[0].zoomValue += this.car.speed / this.car.maxSpeed / (500 / this.car.decreaseCoeff * coeff);
                }

                if (this.car.speed === 0) {
                    setTimeout(() => {
                        this.arrow.rotationSpeedArrow = -2.05
                    }, 1000)
                }

                this.arrow.rotate();
            }
        };

        this.post = {
            accelOn: true,
            accelOff: true,
            brakeOn: true,
            brakeOff: true
        };

        this.time = {
            timeStart: false,
            minutes: null,
            seconds: null,
            milliseconds: null,
            start: null,
            duration: null,
            bestTime: {
                seconds: null,
                milliseconds: null
            }
        };

        this.button = {
            flag: false,
            gasButton: {
                object: this.add.image(1750, 750, 'gas').setOrigin(0).setDepth(10).setInteractive({cursor: 'pointer'}),
                active: false,
                isClick: false,
                isOver: false,
                isClickDownBeforeStart: false,
                isClickUpBeforeStart: true
            },
            stopButton: {
                object: this.add.image(1400, 850, 'stop').setOrigin(0).setDepth(10).setInteractive({cursor: 'pointer'}),
                active: false,
                isOver: false,
                isClick: false
            }
        };

        // this.input.mouse.disableContextMenu();
        this.cursors = this.input.keyboard.createCursorKeys();

        //Управление мышью

        this.button.gasButton.object.on('pointerdown', () => {
            this.post.accelOff = true;

            if (!this.button.flag) {
                this.button.gasButton.isClickDownBeforeStart = true;
                this.button.gasButton.isClickUpBeforeStart = false;
            }

            if (this.post.accelOn && this.button.flag && this.button.gasButton.isClickUpBeforeStart) {
                this.button.gasButton.isClick = true;
                game.scene.scenes[0].telemetry('accel_on');
                this.post.accelOn = false;
            }
        });

        this.button.gasButton.object.on('pointerup', () => {
            this.button.gasButton.isClick = false;
            this.post.accelOn = true;
            this.button.gasButton.isClickUpBeforeStart = true;

            if (this.post.accelOff && this.button.flag) {
                game.scene.scenes[0].telemetry('accel_off');
                this.post.accelOff = false;
            }
        });

        this.button.stopButton.object.on('pointerdown', () => {
            this.button.stopButton.isClick = true;
            this.post.brakeOff = true;

            if (this.post.brakeOn && this.button.flag) {
                game.scene.scenes[0].telemetry('brake_on');
                this.post.brakeOn = false;
            }
        });

        this.button.stopButton.object.on('pointerup', () => {
            this.button.stopButton.isClick = false;
            this.post.brakeOn = true;

            if (this.post.brakeOff && this.button.flag) {
                game.scene.scenes[0].telemetry('brake_off');
                this.post.brakeOff = false;
            }
        });


        this.button.gasButton.object.on('pointerover', () => {
            this.button.gasButton.isOver = true;
        });

        this.button.gasButton.object.on('pointerout', () => {
            if (!this.cursors.up.isDown) {
                this.button.gasButton.isClick = false;
                this.post.accelOn = true;
                this.button.gasButton.isClickUpBeforeStart = true;

                if (this.post.accelOff && this.button.flag) {
                    game.scene.scenes[0].telemetry('accel_off');
                    this.post.accelOff = false;
                }
            }
        });

        this.button.stopButton.object.on('pointerover', () => {
            this.button.stopButton.isOver = true;
        });

        this.button.stopButton.object.on('pointerout', () => {
            if (!this.cursors.down.isDown) {
                this.button.stopButton.isClick = false;
                this.post.brakeOn = true;

                if (this.post.brakeOff && this.button.flag) {
                    game.scene.scenes[0].telemetry('brake_off');
                    this.post.brakeOff = false;
                }
            }
        });

        //Управление клавиатурой

        this.input.keyboard.on('keydown-UP', function () {
            this.post.accelOn = true;

            if (!this.button.flag) {
                this.button.gasButton.isClickDownBeforeStart = true;
                this.button.gasButton.isClickUpBeforeStart = false;
            }

            if (this.post.accelOff && this.button.flag) {
                game.scene.scenes[0].telemetry('accel_off');
                this.post.accelOff = false;
            }
        }, this);

        this.input.keyboard.on('keyup-UP', function () {
            this.post.accelOff = true;
            this.button.gasButton.isClickUpBeforeStart = true;

            if (this.post.accelOn && this.button.flag) {
                game.scene.scenes[0].telemetry('accel_on');
                this.post.accelOn = false;
            }
        }, this);

        this.input.keyboard.on('keyup-DOWN', function () {
            this.post.brakeOff = true;

            if (this.post.brakeOn && this.button.flag) {
                game.scene.scenes[0].telemetry('brake_on');
                this.post.brakeOn = false;
            }
        }, this);

        this.input.keyboard.on('keydown-DOWN', function () {
            this.post.accelOn = true;

            if (this.post.accelOff && this.button.flag) {
                game.scene.scenes[0].telemetry('accel_off');
                this.post.accelOff = false;
            }
        }, this);

        //Светофор

        let trafficLight = this.add.sprite(0, 0, 'trafficLight', 0).setDepth(300);
        this.trafficLight = Phaser.Display.Align.In.Center(trafficLight, this.add.zone(951, 540, 1922, 1080)).setAlpha(0);

        this.createStartPopup();

        //Спидометр

        let speedometerImg = this.add.image(0, 0, 'speedometer');
        this.speedometer.arrow.object = this.add.image(0, 0, 'arrow').setOrigin(1);
        this.speedometer.arrow.rotate();
        this.add.container(1150, 870, [speedometerImg, this.speedometer.arrow.object]).setScrollFactor(0).setDepth(20);

        //Попытка и таймер

        let infoAttempt = this.add.dom(0, 0, 'div', 'width: 300px;' +
            'font: 18px Arial; text-align: center; font-weight: bold; color: #0058a3; font-style: italic', `${repeatCount} попытка: `);
        this.infoTimer = this.add.dom(0, 40, 'div', 'width: 300px;' +
            'font: 44px Arial; text-align: center; font-weight: bold; color: #0058a3; font-style: italic', `00:00.000`);
        this.add.container(1000, 60, [infoAttempt, this.infoTimer]).setScrollFactor(0);

        //Лучшее время

        this.winTextTime = this.add.dom(-10, -120, 'div', 'width: 300px;' +
            'background-color: #0058a3; box-sizing: border-box; font: 50px Arial; text-align: center;' +
            'font-weight: bold; color: #FFDE35; font-style: italic; padding: 0 0 0 20px', `00:00.000`);

        this.theBestTimeValue = this.add.dom(0, 35, 'div', 'width: 200px;' +
            'background-color: #0058a3; box-sizing: border-box; font: 44px Arial; text-align: left;' +
            'font-weight: bold; color: #FFDE35; font-style: italic; padding: 0 0 0 20px', `00.000`);
        let theBestTime = this.add.dom(0, 0, 'div', 'width: 200px;' +
            'background-color: #0058a3; box-sizing: border-box; font: 14px Arial; text-align: left; font-weight: bold;' +
            'color: #FFDE35; font-style: italic; text-transform: uppercase; padding: 7px 0 0 25px', 'лучшее время: ');
        this.add.container(1830, 40, [theBestTime, this.theBestTimeValue]).setScrollFactor(0);

        game.scene.scenes[0].increaseAlpha();

        let particles = this.add.particles('snow');

        this.emit = particles.createEmitter({
            x: 200,
            y: -1030,
            speed: 20,
            gravityY: 20,
            scale: 0.2,
            lifespan: 25000,
            emitZone: {source: new Phaser.Geom.Rectangle(0, 0, 1922, 1080), quantity: 150}
        });

        game.scene.scenes[0].sideEffects.postTrack();
        this.count2 = 0;
        this.dateNow = Date.now()
    },

    update: function () {

        if (Date.now() - this.dateNow < 1000) {
            this.count2++;
        } else {
            console.log(this.count2)
            this.dateNow = Date.now();
            this.count2 = 0;
        }

        if (game.scene.scenes[0].track.trackType === 1 || game.scene.scenes[0].track.trackType === 0) {
            this.emit.active = false;
            this.emit.setAlpha(0);
        }

        if (this.button.flag) {
            //Управление клавиатурой

            if ((this.button.gasButton.isClick || this.cursors.up.isDown) && this.button.gasButton.isClickUpBeforeStart) {
                this.button.gasButton.active = true;
                this.button.stopButton.active = false;
            } else if ((!this.cursors.up.isDown && !this.button.gasButton.isClick) || !this.button.gasButton.isOver) {
                this.button.gasButton.active = false;
            }

            if (this.cursors.down.isDown || this.button.stopButton.isClick) {
                this.button.stopButton.active = true;
                this.button.gasButton.active = false;
            } else if (!this.cursors.down.isDown && !this.button.stopButton.isClick) {
                this.button.stopButton.active = false;
            }

            //Анимация кнопки "газ"

            if (this.button.gasButton.active && this.button.gasButton.object.y < 780) {
                this.button.gasButton.object.y += 1;
            } else if (!this.button.gasButton.active && this.button.gasButton.object.y > 750) {
                this.button.gasButton.object.y -= 1;
            }

            //Анимация кнопки "стоп"

            if (this.button.stopButton.active && this.button.stopButton.object.y < 880) {
                this.button.stopButton.object.y += 1;
            } else if (!this.button.stopButton.active && this.button.stopButton.object.y > 850) {
                this.button.stopButton.object.y -= 1;
            }
        }

        if (this.button.gasButton.active) {
            game.scene.scenes[0].car.increaseSpeed();
            this.speedometer.increaseSpeed();
        }

        if (this.button.stopButton.active && game.scene.scenes[0].car.speed > 0) {
            game.scene.scenes[0].car.decreaseSpeed();
            this.speedometer.decreaseSpeed();
        }

        if (!this.button.stopButton.active && !this.button.gasButton.active && game.scene.scenes[0].car.startTrip && game.scene.scenes[0].car.speed > 0) {
            game.scene.scenes[0].car.decreaseSpeed(5);
            this.speedometer.decreaseSpeed(5);
        }

        if (this.time.timeStart) {
            this.timer();
            this.winTextTime.node.innerText = this.infoTimer.node.innerText = `${this.time.minutes}:${this.time.seconds}.${this.time.milliseconds}`;
        }
    },

    createStartPopup: function () {
        // Выбор шин

        let tire1 = this.add.image(-200, -70, 'tire1').setInteractive({cursor: 'pointer'});
        let tire2 = this.add.image(0, -70, 'tire2').setInteractive({cursor: 'pointer'});
        let tire3 = this.add.image(200, -70, 'tire3').setInteractive({cursor: 'pointer'});
        let select = this.add.image(-200, -90, 'select');

        //Коэффициенты трения в зависимости от шин + смещение выбора

        tire1.on('pointerdown', () => {
            game.scene.scenes[0].car.setSpeed(1, 1300, 0);
            select.x = -200;
        });

        tire2.on('pointerdown', () => {
            game.scene.scenes[0].car.setSpeed(2, 1300, 1);
            select.x = 0;
        });

        tire3.on('pointerdown', () => {
            game.scene.scenes[0].car.setSpeed(3, 1300, 2);
            select.x = 200;
        });

        //Попап при старте игры

        let popup = this.add.image(0, 0, 'popup');
        let buttonLetsGo = this.add.image(0, 230, 'buttonLetsGo').setInteractive({cursor: 'pointer'});
        let tiresContainer = this.add.container(0, 120, [tire1, tire2, tire3, select]);
        let popupContainer = this.add.container(600, 500, [popup, tiresContainer, buttonLetsGo]).setDepth(300);
        this.popupContainer = Phaser.Display.Align.In.Center(popupContainer, this.add.zone(961, 540, 1922, 1080));

        buttonLetsGo.on('pointerdown', () => {
            this.popupContainer.destroy();
            this.trafficLightChangeFrames();
            game.scene.scenes[0].telemetry('tyre_selected');
        });
    },

    createWinPopupAnUnauthorized: function () {
        let winPopup = this.add.image(0, 0, 'winPopup');
        let winButtonTryAgain = this.add.image(200, 100, 'buttonTryAgain').setInteractive({cursor: 'pointer'});
        let winButtonSaveResult = this.add.image(-250, 100, 'buttonSaveResult').setInteractive({cursor: 'pointer'});
        let winPopupContainer = this.add.container(600, 500, [winPopup, this.winTextTime, winButtonTryAgain, winButtonSaveResult]);
        Phaser.Display.Align.In.Center(winPopupContainer, this.add.zone(961, 540, 1922, 1080)).setDepth(300);

        winButtonTryAgain.on('pointerdown', () => {
            game.scene.scenes[0].restartScene();
        });

        winButtonSaveResult.on('pointerdown', () => {
            game.scene.scenes[0].restartScene();
            window.top.open(SERVER_URL + `goodyear/auth/${game.scene.scenes[0].track.id}`, '_self');
        });
    },

    createWinPopupAnAuthorizedBestResult: function () {
        let winPopup = this.add.image(0, 0, 'winPopup');
        let winButtonRepeat = this.add.image(0, 120, 'buttonRepeat').setInteractive({cursor: 'pointer'});
        let winPopupContainer = this.add.container(600, 500, [winPopup, this.winTextTime, winButtonRepeat]);
        Phaser.Display.Align.In.Center(winPopupContainer, this.add.zone(961, 540, 1922, 1080)).setDepth(300);

        winButtonRepeat.on('pointerdown', () => {
            game.scene.scenes[0].restartScene();
        });
    },

    createWinPopupAnAuthorizedBadResult: function () {
        let winPopup = this.add.image(0, 0, 'badResultPopup');
        let buttonRepeat = this.add.image(0, 110, 'buttonRepeat').setInteractive({cursor: 'pointer'});
        let winPopupContainer = this.add.container(600, 500, [winPopup, this.winTextTime, buttonRepeat]);
        Phaser.Display.Align.In.Center(winPopupContainer, this.add.zone(961, 540, 1922, 1080)).setDepth(300);

        buttonRepeat.on('pointerdown', () => {
            game.scene.scenes[0].restartScene();
        });
    },

    createLosingPopup: function () {
        let losingPopup = this.add.image(0, 0, 'losingPopup');
        let losingButtonRepeat = this.add.image(0, 70, 'buttonRepeat').setInteractive({cursor: 'pointer'});
        let losingPopupContainer = this.add.container(600, 500, [losingPopup, losingButtonRepeat]);
        this.losingPopup = Phaser.Display.Align.In.Center(losingPopupContainer, this.add.zone(961, 540, 1922, 1080)).setDepth(300);

        losingButtonRepeat.on('pointerdown', () => {
            game.scene.scenes[0].restartScene();
        });
    },

    trafficLightChangeFrames: function () {
        let self = this;
        this.trafficLight.alpha = 1;

        function delay(time) {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        }

        delay(1000)
            .then(function () {
                self.trafficLight.setFrame(1);
                return delay(1000);
            })
            .then(function () {
                self.trafficLight.setFrame(2);
                return delay(self.random());
            })
            .then(function () {
                self.trafficLight.setFrame(3);
                game.scene.scenes[1].startTimerAndButtons();
                return delay(1000);
            })
            .then(function () {
                self.trafficLight.destroy();
            });
    },

    random: function (min = 1, max = 5) {
        return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
    },

    win: function () {
        if (this.time.timeStart) {
            if (!game.scene.scenes[0].track.authorized) {
                this.createWinPopupAnUnauthorized();
            }

            if (game.scene.scenes[0].track.authorized) {

                if (this.time.duration < game.scene.scenes[0].track.best) {
                    this.createWinPopupAnAuthorizedBestResult();
                } else {
                    this.createWinPopupAnAuthorizedBadResult();
                }
            }

            clearInterval(this.timerInterval);
            this.time.timeStart = false;
            game.scene.scenes[0].telemetry('game_over', true);
        }
    },

    lose: function () {
        clearInterval(this.timerInterval);

        if (this.time.timeStart) {
            setTimeout(() => {
                this.createLosingPopup();
            }, 1500);

            this.time.timeStart = false;
            game.scene.scenes[0].telemetry('game_over', false);
        }
    },

    startTimerAndButtons: function () {
        this.button.flag = true;
        this.time.start = Date.now();
        this.time.timeStart = true;
        game.scene.scenes[0].telemetry('start');
    },

    bestTime: function (bestTime) {
        if (bestTime) {
            let delta = bestTime - Math.floor(bestTime / 60000) * 60000;
            let secs = Math.floor(delta / 1000);
            delta = delta - secs * 1000;
            let ms = delta;

            this.time.bestTime.seconds = this.format(secs, 2);
            this.time.bestTime.milliseconds = this.format(ms, 3);
            this.theBestTimeValue.node.innerText = `${this.time.bestTime.seconds}.${this.time.bestTime.milliseconds}`;
        }
    },

    timer: function () {
        this.timerInterval = setInterval(() => {
            let delta = this.time.duration = Date.now() - this.time.start;
            let mins = Math.floor(delta / 60000);
            delta = delta - mins * 60000;
            let secs = Math.floor(delta / 1000);
            delta = delta - secs * 1000;
            let ms = delta;

            this.time.minutes = this.format(mins, 2);
            this.time.seconds = this.format(secs, 2);
            this.time.milliseconds = this.format(ms, 3);
        }, 40);
    },

    format: function (numb, maxFigures) {
        let numStr = numb + '';

        while (numStr.length < maxFigures) {
            numStr = '0' + numStr;
        }

        return numStr;
    }
});

const GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function WorldScene() {
            Phaser.Scene.call(this, {key: 'world'});
        },

    preload: function () {
        this.load.image('background_0', 'images/fon_0.jpg');
        this.load.image('background_1', 'images/fon_1.jpg');
        this.load.image('background_2', 'images/fon_2.jpg');
        this.load.image('finishFirstPart', 'images/finish1.png');
        this.load.image('finishSecondPart', 'images/finish2.png');
        this.load.image('start', 'images/start.png');
        this.load.multiatlas('car', 'images/car.json', 'images');
    },

    create: function () {
        //Данные, прихождящие с сервера

        this.track = {};
        this.summary = [];

        //Запрос на сервер

        let self = this;

        this.sideEffects = {
            baseURL: SERVER_URL + 'goodyear/api',
            postTrack() {
                fetch(`${this.baseURL}/track`, {
                    header: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST'
                })
                    .then(result => result.json())
                    .then(response => self.track = {
                        ...response.track,
                        tyresTraction: [
                            ...response.track.tyresTraction
                        ]
                    })
                    .then(track => {
                        self.loadBackground(track.trackType);
                        self.car.setSpeed(1, 1300, 0); // Первоначальный выбор шины
                        self.telemetry('loaded');
                        self.increaseAlpha();
                        game.scene.scenes[1].bestTime(track.absolute);
                    })
                    .catch(function () {
                        self.restartScene()
                    })
            },
            postTelemetry(object, event) {
                fetch(`${this.baseURL}/telemetry/${self.track.id}`, {
                    header: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(object),
                    method: 'POST'
                })
                    .then(function () {
                        if (event === 'game_over') {
                            self.telemetry('summary')
                        }
                    })
            }
        };

        this.cameras.main.setBounds(0, -200, 6000, 4000);
        this.physics.world.setBounds(0, -200, 6000, 4000);

        //Машинка

        let count = 0;

        this.car = {
            object: null,
            speed: 0,
            coefficient: 0,
            animation: null,
            maxSpeed: 0,
            startTrip: false,
            startCoeff: null,
            decreaseCoeff: null,
            tyre: null,
            setSpeed(coeff, maxSpeed, tyre = 0) {
                this.tyre = tyre;
                this.startCoeff = this.decreaseCoeff = this.coefficient = self.track.tyresTraction[tyre] * 1.5;
                this.maxSpeed = maxSpeed;
            },
            increaseSpeed: function () {
                if (this.object.body.speed <= this.maxSpeed) {
                    this.speed += this.coefficient;

                    if (this.speed > 500) {
                        if (!count) {
                            this.decreaseCoeff = this.coefficient;
                            count = 1;
                        }

                        this.coefficient *= 0.99;
                    } else {
                        this.coefficient *= 1.01;
                    }
                }

                this.startTrip = true;
                self.updateAcceleration();
            },
            decreaseSpeed: function (coeff = 1) {
                if (this.decreaseCoeff >= this.startCoeff) {
                    this.decreaseCoeff /= 1.002;
                }

                this.speed -= (this.decreaseCoeff / coeff);

                if (this.speed < 5) {
                    this.speed = 0;
                    this.coefficient = this.startCoeff;
                }

                self.updateAcceleration();
            }
        };

        this.car.object = this.physics.add.sprite(250, 2390, 'car', 'car_1.png').setScale(0.6).setDepth(100).setAlpha(0);
        this.start = this.add.image(340, 2350, 'start').setDepth(50).setAlpha(0);

        let carFrames = this.anims.generateFrameNames('car', {
            start: 1, end: 4, zeroPad: 1,
            prefix: 'car_', suffix: '.png'
        });

        this.anims.create({key: 'car', frames: carFrames, frameRate: 32, repeat: -1});
        this.car.animation = this.car.object.anims.play('car');
        this.car.animation.anims.currentAnim.paused = true;

        this.car.object.setDamping(true); // Отключить линейное замедление
        this.car.object.setDrag(0.99); // Как быстро машинка будет замедляться

        //Финиш

        this.add.image(5700, 100, 'finishFirstPart').setDepth(200);
        this.finish = this.add.image(5700, 100, 'finishSecondPart').setDepth(50);

        //Зум

        this.zoomValue = 1.3;
        this.cameras.main.startFollow(this.car.object, false, 1, 1);
        this.zoom(this.zoomValue);
        this.scrollY = 200;
        this.cameras.main.followOffset.set(-500, this.scrollY);

        this.scene.launch('ui');
    },

    update: function () {
        if (this.finish.x - 50 <= this.car.object.x &&
            this.finish.x + 45 >= this.car.object.x && this.car.object.body.speed === 0) {
            game.scene.scenes[1].win();
        }

        if (this.finish.x + 45 < this.car.object.x) {
            game.scene.scenes[1].lose();
        }

        this.zoom(this.zoomValue);
    },

    telemetry: function (event, success) {
        let self = this;
        let count = true;
        let scene = game.scene.scenes[1];
        let time;

        if (event === 'game_over') {
            time = +`${scene.time.minutes}${scene.time.seconds}${scene.time.milliseconds}`;
        }

        function choiceEvent(event, success) {
            let obj = {
                event: event,
                timestamp: Date.now(),
                position: self.car.object.x,
            };

            switch (event) {
                case 'tyre_selected':
                    return {
                        ...obj,
                        tyre: self.car.tyre
                    };
                case 'game_over':
                    return {
                        ...obj,
                        success: success,
                        race_time: time,
                    };
                case 'summary':
                    return {
                        ...obj,
                        events: {
                            ...self.summary
                        }
                    };
                default:
                    return {
                        ...obj,
                    }
            }
        }

        this.summary.forEach(i => {
            count = !(i.event === 'game_over' && (event === 'accel_on' || event === 'accel_off' ||
                event === 'brake_on' || event === 'accel_off'));
        });

        if (((this.summary[this.summary.length - 1] && this.summary[this.summary.length - 1].event !== choiceEvent(event, success).event) ||
            !this.summary.length) && count) {
            this.summary.push(choiceEvent(event, success));
            this.sideEffects.postTelemetry(choiceEvent(event, success), event);
        }
    },

    loadBackground: function (id = 0) {
        this.add.image(0, 1300, `background_${id}`).setOrigin(0).setScrollFactor(1);
        this.add.image(1500, 690, `background_${id}`).setOrigin(0).setScrollFactor(1);
        this.add.image(3000, 80, `background_${id}`).setOrigin(0).setScrollFactor(1);
        this.add.image(4500, -530, `background_${id}`).setOrigin(0).setScrollFactor(1);

        if (restart) {
            this.increaseAlpha()
        }
    },

    restartScene: function () {
        repeatCount++;
        this.scene.restart();
    },

    increaseAlpha: function () {
        this.car.object.setAlpha(1);
        this.start.setAlpha(1);
    },

    updateAcceleration: function () {
        this.physics.moveTo(this.car.object, this.finish.x + 800, this.finish.y - 250, this.car.speed);

        if (this.car.speed === 0) {
            this.car.object.body.stop()
        }

        this.car.animation.anims.currentAnim.paused = this.car.speed === 0;
    },

    zoom: function (zoom) {
        this.cameras.main.startFollow(this.car.object, true, 1, 1);
        this.cameras.main.setZoom(zoom);
        this.cameras.main.followOffset.set(-500, this.scrollY);
    }
});

const config = {
    type: Phaser.WEBGL,
    parent: 'goodyear-game',
    backgroundColor: '#FFFFFF',
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1922,
        height: 1080
    },
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: {y: 0},
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: [GameScene, UIScene]
};

let game = new Phaser.Game(config);
