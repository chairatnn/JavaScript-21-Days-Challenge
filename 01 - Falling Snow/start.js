// Immediately Invoked Function Expression (IIFE) การสร้างห้องปิด 
(() => {

// สร้างตัวเลขสุ่มแบบจำนวนเต็มระหว่าง min ถึง max

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// เตรียมความพร้อมก่อนเริ่มการทำงาน 
  // หาองค์ประกอบ <canvas> ในหน้า HTML. 
  // กำหนดให้ขนาดของ Canvas กว้างและสูงเท่ากับหน้าจอของผู้ใช้พอดี. 
  // ดึง Context 2D ออกมา (ตัวพู่กันสำหรับวาด). 
// ผลลัพธ์: ส่งคืนออบเจกต์ที่มี Canvas, Context 2D (พู่กัน) และกำหนดจำนวนหิมะ 250 ก้อน.

// 1. เพิ่มฟังก์ชันใหม่สำหรับปรับขนาด Canvas
  function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function setup() {
    const canvas = document.getElementById('falling-snow-canvas');
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

  // เรียกใช้เพื่อตั้งค่าขนาดเริ่มต้น
    resizeCanvas(canvas);

    return {
      canvas,
      canvasContext: canvas.getContext('2d'),
      numberOfSnowBalls: 250
    };
  }

// สร้างเกล็ดหิมะ Array ของเกล็ดหิมะตามจำนวนที่กำหนด
// รายละเอียด: เกล็ดหิมะแต่ละก้อนเป็น Object ที่มีคุณสมบัติ:
  // x, y: ตำแหน่ง เริ่มต้นแบบสุ่มใน Canvas.
  // opacity: ความโปร่งใส สุ่ม (ทำให้ดูสมจริง).
  // speedX, speedY: ความเร็ว ในการเคลื่อนที่แกน X (ลม) และแกน Y (ตกลง).
  // radius: ขนาด สุ่มของเกล็ดหิมะ.

  function createSnowBalls(canvas, numberOfSnowBalls) {
    return [...Array(numberOfSnowBalls)].map(() => {
      return {
        x: random(0, canvas.width),
        y: random(0, canvas.height),
        opacity: random(0.5, 1),
        speedX: random(-5, 5),
        speedY: random(1, 3),
        radius: random(2, 4)
      };
    });
  }

// วาดเกล็ดหิมะ สร้างฟังก์ชันย่อยที่รับเกล็ดหิมะ 1 ก้อน เข้ามา แล้วใช้ Context 2D วาดมัน
// การสร้าง "คนวาด" ที่รู้วิธีวาดวงกลม (ใช้ arc) โดยใช้ตำแหน่ง, รัศมี, และความโปร่งใสของเกล็ดหิมะแต่ละก้อน.

  function createSnowBallDrawer(canvasContext) {
    return snowBall => {
      canvasContext.beginPath();
      canvasContext.arc(
        snowBall.x,
        snowBall.y,
        snowBall.radius,
        0,
        Math.PI * 2
      );
      canvasContext.fillStyle = `rgba(255, 255, 255, ${snowBall.opacity})`;
      canvasContext.fill();
    };
  }

// การเคลื่อนที่ของหิมะ สร้างฟังก์ชันย่อยที่รับเกล็ดหิมะ 1 ก้อนเข้ามา แล้วอัปเดตตำแหน่งของมัน
  // อัปเดตตำแหน่ง: ตำแหน่งใหม่ (x, y) คือตำแหน่งเดิมบวกด้วยความเร็ว (speedX, speedY).
  // ขอบเขตด้านข้าง (X): ถ้าหิมะออกไปทางขวา จะถูกวาร์ปกลับไปเริ่มที่ขอบซ้าย (และกลับกัน).
  // ขอบเขตด้านล่าง (Y): ถ้าหิมะตกลงมาถึงขอบล่าง จะถูกวาร์ปกลับไปเริ่มที่ขอบบน (y = 0).

  function createSnowBallMover(canvas) {
    return snowBall => {
      snowBall.x += snowBall.speedX;
      snowBall.y += snowBall.speedY;

      if (snowBall.x > canvas.width) {
        snowBall.x = 0;
      } else if (snowBall.x < 0) {
        snowBall.x = canvas.width;
      }

      if (snowBall.y > canvas.height) {
        snowBall.y = 0;
      }
    };
  }

// หัวใจหลักของแอนิเมชัน
// การเตรียมเรียกใช้ setup(), createSnowBalls(), createSnowBallDrawer(), และ createSnowBallMover() เพื่อเตรียมทรัพยากร.
// setInterval(() => { ... }, 50): คือ Loop ที่ทำงานซ้ำๆทุกๆ 50 มิลลิวินาที (20เฟรมต่อวินาที). ภายในลูปนี้จะทำ 3 อย่างหลักๆ:
  // canvasContext.clearRect(...): ล้าง Canvas ทั้งหมดเพื่อลบภาพเก่าของหิมะ.
  // snowBalls.forEach(drawSnowBall): วนซ้ำเกล็ดหิมะทั้งหมดแล้ววาดแต่ละก้อนในตำแหน่งปัจจุบัน.
  // snowBalls.forEach(moveSnowBall): วนซ้ำเกล็ดหิมะทั้งหมดแล้วคำนวณตำแหน่งใหม่ของแต่ละก้อน.

  function run() {
    const { canvas, canvasContext, numberOfSnowBalls } = setup();
  // เปลี่ยนเป็น 'let'
    let snowBalls = createSnowBalls(canvas, numberOfSnowBalls);
    // const snowBalls = createSnowBalls(canvas, numberOfSnowBalls);
    const drawSnowBall = createSnowBallDrawer(canvasContext);
    const moveSnowBall = createSnowBallMover(canvas);

    // 2. เพิ่มฟังก์ชันจัดการการปรับขนาด
    const handleResize = () => {
      // 1. ปรับขนาด Canvas 
      resizeCanvas(canvas); 
      // 2. สร้างหิมะใหม่ทั้งหมดเพื่อให้หิมะกระจายเต็มพื้นที่ใหม่
      snowBalls = createSnowBalls(canvas, numberOfSnowBalls);
    };

    // ใช้ addEventListener เพื่อจัดการ Event การปรับขนาดหน้าจอ
    window.addEventListener('resize', handleResize);

    setInterval(() => {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      snowBalls.forEach(drawSnowBall);
      snowBalls.forEach(moveSnowBall);
    }, 50);
  }

  run();
})();