// -------------------------
// 🎮 캔버스 세팅
// -------------------------
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 800;
document.body.appendChild(canvas);

// -------------------------
// 🎨 이미지 로드
// -------------------------
let backgroundimage, spaceshipimage, enemyimage, gameoverimage;
let gameOver = false;
let score = 0;
let life = 3;  // 목숨 3개

// 우주선 좌표
let spaceshipx = canvas.width / 2 - 60;
let spaceshipy = canvas.height - 100;

// 시간 관련 변수
let gameTime = 0;
let lastTime = 0;  // 이전 프레임 시간 기록
let lastSpawnTime = 0;
let enemySpeedBase = 3;          // 시작 적 속도
let spawnIntervalBase = 1000;    // 시작 적 생성 간격(ms)

// 이미지 불러오기 및 게임 시작
function loadimage(){
    backgroundimage = new Image();
    backgroundimage.src = "images/spacebackground.webp";

    spaceshipimage = new Image();
    spaceshipimage.src = "images/spaceship.png";

    enemyimage = new Image();
    enemyimage.src = "images/removecrow.png";

    gameoverimage = new Image();
    gameoverimage.src = "images/gameover.png";

    backgroundimage.onload = function(){
        main(0);  // 게임 시작
    }
}

// -------------------------
// ⌨️ 키보드 입력 처리
// -------------------------
let keysDown = {};
function setupKeyboardListener(){
    document.addEventListener("keydown", function(e) {
        keysDown[e.keyCode] = true;

        // 스페이스바 누르면 총알 발사
        if(e.code === "Space" && !gameOver){
            createBullet();
        }

        // 'O' 키로 게임 재시작
        if(e.key.toLowerCase() === 'o' && gameOver){
            restartGame();
        }
    });

    document.addEventListener("keyup", function(e) {
        delete keysDown[e.keyCode];
    });
}

// -------------------------
// 🧠 게임 상태 업데이트
// -------------------------
function update(delta){
    if(39 in keysDown){ spaceshipx += 5; }
    if(37 in keysDown){ spaceshipx -= 5; }

    if(spaceshipx < 0) spaceshipx = 0;
    if(spaceshipx > canvas.width - 120) spaceshipx = canvas.width - 120;

    // 적 속도 점진 증가
    enemySpeed = enemySpeedBase + Math.floor(gameTime / 10000);

    // 적 생성 간격 점진 감소
    spawnInterval = spawnIntervalBase - Math.floor(gameTime / 15000) * 100;
    if(spawnInterval < 200) spawnInterval = 200;

    // 적 생성
    if(gameTime - lastSpawnTime > spawnInterval){
        createEnemy();
        lastSpawnTime = gameTime;
    }
}

// -------------------------
// 🔫 총알 관련
// -------------------------
let bulletList = [];

function Bullet() {
    this.x = 0;
    this.y = 0;
    this.alive = true;

    this.init = function(){
        this.x = spaceshipx + 50;
        this.y = spaceshipy;
        bulletList.push(this);
    };

    this.update = function(){
        this.y -= 7;
        if(this.y < 0) this.alive = false;
    };

    this.checkHit = function(){
        for(let i = 0; i < enemyList.length; i++){
            let e = enemyList[i];
            if(
                this.y <= e.y + 60 &&
                this.x >= e.x &&
                this.x <= e.x + 60
            ){
                score++;
                this.alive = false;
                enemyList.splice(i,1);
                break;
            }
        }
    }
}

function createBullet(){
    let b = new Bullet();
    b.init();
}

function updateBullets(){
    for(let i=0; i < bulletList.length; i++){
        if(bulletList[i].alive){
            bulletList[i].update();
            bulletList[i].checkHit();
        }
    }
    bulletList = bulletList.filter(b => b.alive);
}

function renderBullets(){
    ctx.fillStyle = "red";
    bulletList.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x + 10, b.y, 5, 0, 2*Math.PI);
        ctx.fill();
    });
}

// -------------------------
// 👾 적 관련
// -------------------------
let enemyList = [];
let enemySpeed = enemySpeedBase;
let spawnInterval = spawnIntervalBase;

function Enemy(){
    this.x = Math.random() * (canvas.width - 60);
    this.y = 0;
    this.init = function () {
        enemyList.push(this);
    };
    this.update = function(){
        this.y += enemySpeed;
    };
}

function createEnemy(){
    if(!gameOver){
        let e = new Enemy();
        e.init();
    }
}

function updateEnemies(){
    for(let i=0; i < enemyList.length; i++){
        let e = enemyList[i];
        e.update();

        if(e.y >= canvas.height - 60){
            life--;
            enemyList.splice(i,1);
            i--;
            if(life <= 0){
                gameOver = true;
                break;
            }
        }
    }
}

// -------------------------
// 🎯 렌더링
// -------------------------
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundimage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(spaceshipimage, spaceshipx, spaceshipy, 120, 60);
    renderBullets();

    enemyList.forEach(e => {
        ctx.drawImage(enemyimage, e.x, e.y, 60, 60);
    });

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);

    for(let i=0; i<life; i++){
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(30 + i*30, 70, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// -------------------------
// 🕹️ 메인 루프
// -------------------------
function main(timestamp){
    if(!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    gameTime += delta;

    if(!gameOver){
        update(delta);
        updateBullets();
        updateEnemies();
        render();
        requestAnimationFrame(main);
    } else {
        // 게임 오버 화면
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(backgroundimage, 0, 0, canvas.width, canvas.height);

        // 이미지 중앙 표시
        const imgWidth = 400;
        const imgHeight = 240;
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = (canvas.height - imgHeight) / 2 - 50;
        ctx.drawImage(gameoverimage, imgX, imgY, imgWidth, imgHeight);

        // 텍스트 표시
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "36px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, imgY + imgHeight + 60);

        ctx.font = "24px Arial";
        ctx.fillText("Press 'O' to Restart", canvas.width / 2, imgY + imgHeight + 100);
    }
}

// -------------------------
// 🆕 게임 재시작 함수
// -------------------------
function restartGame(){
    gameOver = false;
    life = 3;
    score = 0;
    enemyList = [];
    bulletList = [];
    spaceshipx = canvas.width / 2 - 60;
    spaceshipy = canvas.height - 100;
    gameTime = 0;
    lastTime = 0;
    lastSpawnTime = 0;
    main(0);
}

// -------------------------
// 🚀 실행부
// -------------------------
setupKeyboardListener();
loadimage();

window.onload = function() {
    // 🌌 배경 별 효과 + 오른쪽 패널 + 난이도 + 최고점수 저장
    // ---------- 별 효과 ----------
    let stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 1 + 0.5
        });
    }

    function drawStars() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        for (let star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function moveStars() {
        for (let star of stars) {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        }
    }

    // 기존 render() 확장
    const originalRender = render;
    render = function() {
        drawStars();
        moveStars();
        originalRender();
    };

    // ---------- 오른쪽 패널 ----------
    const infoPanel = document.createElement("div");
    infoPanel.style.position = "absolute";
    infoPanel.style.left = `${canvas.width + 50}px`;
    infoPanel.style.top = "50px";
    infoPanel.style.width = "300px";
    infoPanel.style.color = "white";
    infoPanel.style.fontFamily = "Arial";
    infoPanel.style.lineHeight = "1.6";
    infoPanel.style.fontSize = "18px";
    infoPanel.style.padding = "20px";
    infoPanel.style.background = "rgba(10, 10, 20, 0.6)";
    infoPanel.style.borderRadius = "12px";
    infoPanel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    document.body.appendChild(infoPanel);

    let bestScore = Number(localStorage.getItem("bestScore") || 0);

function updateInfoPanel() {
    infoPanel.innerHTML = `
        <h2 style="margin-top:0;">🛰 Game Info</h2>
        <p>🕒 <b>Time:</b> ${(gameTime / 1000).toFixed(1)}s</p>
        <p>🏆 <b>Best:</b> ${bestScore}</p>
        <hr style="border:1px solid rgba(255,255,255,0.2)">
        <h3>⚙️ Difficulty</h3>
        <button id="easyBtn">Easy</button>
        <button id="normalBtn">Normal</button>
        <button id="hardBtn">Hard</button>
    `;

    document.getElementById("easyBtn").onclick = () => setDifficulty("easy");
    document.getElementById("normalBtn").onclick = () => setDifficulty("normal");
    document.getElementById("hardBtn").onclick = () => setDifficulty("hard");

    infoPanel.querySelectorAll("button").forEach(btn => {
        btn.style.margin = "4px";
        btn.style.padding = "6px 12px";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.background = "rgba(255,255,255,0.2)";
        btn.style.color = "white";
        btn.onmouseover = () => btn.style.background = "rgba(255,255,255,0.4)";
        btn.onmouseout = () => btn.style.background = "rgba(255,255,255,0.2)";
    });
}


    function setDifficulty(level) {
        if (level === "easy") {
            enemySpeedBase = 2;
            spawnIntervalBase = 1600;
        } else if (level === "normal") {
            enemySpeedBase = 3;
            spawnIntervalBase = 1000;
        } else if (level === "hard") {
            enemySpeedBase = 4.5;
            spawnIntervalBase = 700;
        }
        alert(`난이도가 ${level.toUpperCase()} 로 설정되었습니다!`);
    }

    function saveBestScore() {
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);
        }
    }

    const originalMain = main;
    main = function(timestamp) {
        originalMain(timestamp);
        if (!gameOver) {
            updateInfoPanel();
            saveBestScore();
        }
    };
};
