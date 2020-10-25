(function() {
 var DEBUG, before, c, clamp, collides, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 var BULLET_SPEED = 360.0;
 var ENEMY_SPEED = 50.0;
 var GRAVITY = 0.4;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 // DEBUG = false;
 DEBUG = true;

 c.width = 800;

 c.height = 600;

 keysDown = {};

 keysPressed = {};

 images = [];

 audios = [];

 framesThisSecond = 0;
 fpsElapsed = 0;
 fps = 0

 popups = [];
 toBoom = 0.5;
 toToBoom = 0.5;

 click = null

 bullets = []
 enemies = []
 particles = []

 points = 0

 window.addEventListener("keydown", function(e) {
         keysDown[e.keyCode] = true;
         return keysPressed[e.keyCode] = true;
         }, false);

 window.addEventListener("keyup", function(e) {
         return delete keysDown[e.keyCode];
         }, false);

 c.addEventListener("click", function(e) {
   click = {
     'x': e.offsetX,
     'y': e.offsetY,
   }
 })

 setDelta = function() {
     now = Date.now();
     delta = (now - before) / 1000;
     return before = now;
 };

 if (!DEBUG) {
     console.log = function() {
         return null;
     };
 }

 ogre = false;

 clamp = function(v, min, max) {
     if (v < min) {
         return min;
     } else if (v > max) {
         return max;
     } else {
         return v;
     }
 };

 collides = function(a, b) {
     return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
 };

 player = {
   x: 25,
   y: 500,
   w: 20,
   h: 20,
 }

 tick = function() {
     setDelta();
     elapsed += delta;
     update(delta);
     draw(delta);
     keysPressed = {};
     click = null;
        return window.requestAnimationFrame(tick);
 };

 speed = 120;

 shoot = function(x, y) {
   dx = x - player.x;
   dy = y - player.y;

    mag = Math.sqrt(dx * dx + dy * dy);
    ndx = dx / mag;
    ndy = dy / mag;
 
   bullets.push({
     x: player.x + 10,
     y: player.y + 10,
     dx: ndx,
     dy: ndy,
     w: 5,
     h: 5,
   })

    for(var i = 0; i < 30; i++)
    {
    particles.push({
      x: player.x + 10,
      y: player.y + 10,
      w: 1,
      h: 1,
      dx: ndx + Math.random() - 0.5,
      dy: ndy + Math.random() - 0.5,
      ttl: Math.random() * 1,
      speed: BULLET_SPEED * 0.5,
    })
  }
 }

 spawnEnemy = function() {
   y = Math.random() * 400 + 180;
   x = 850;

   dx = player.x - x;
   dy = player.y - y;

    mag = Math.sqrt(dx * dx + dy * dy);
    ndx = dx / mag;
    ndy = dy / mag;

   enemies.push({
     x: x,
     y: y,
     dx: -1,
     dy: 0,
     w: Math.random() * 40 + 10,
     h: Math.random() * 30 + 5,
   })
 }

 update = function(delta) {

     framesThisSecond += 1;
     fpsElapsed += delta;

     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }

     if(!ogre)
     {

     if(Math.random() <= 0.01) {
       spawnEnemy();
     }

     for(var i = bullets.length - 1; i >= 0; i--) {
       bullets[i].x += bullets[i].dx * delta * BULLET_SPEED + Math.random();
       bullets[i].y += bullets[i].dy * delta * BULLET_SPEED + Math.random();
       bullets[i].dy += delta * GRAVITY;

        if (Math.random() < 0.2)
        {
            particles.push({
              x: bullets[i].x,
              y: bullets[i].y,
              w: 1,
              h: 1,
              dx: -bullets[i].dx + (Math.random() - 0.5) * 0.3,
              dy: -bullets[i].dy + (Math.random() - 0.5) * 0.3,
              ttl: Math.random() * 1,
              speed: BULLET_SPEED * 0.1,
            })
        }

       for(var j = enemies.length - 1; j >= 0; j--) {
         if(collides(bullets[i], enemies[j])) {
           for(var p = 0; p < 60; p++)
            {
            particles.push({
              x: enemies[j].x + enemies[j].w / 2,
              y: enemies[j].y + enemies[j].h / 2,
              w: Math.random() * 4,
              h: Math.random() * 4,
              dx: Math.random() - 0.5,
              dy: Math.random() - 0.5,
              ttl: Math.random() * 2,
              speed: BULLET_SPEED * 0.5,
            })
           }

           points += enemies[j].w * enemies[j].h;

           bullets.splice(i, 1);
           enemies.splice(j, 1);

           break;
         }
       }
     }

     for(var i = enemies.length - 1; i >= 0; i--) {
       enemies[i].x += enemies[i].dx * delta * ENEMY_SPEED;
       enemies[i].y += enemies[i].dy * delta * ENEMY_SPEED;

       if(collides(enemies[i], player)) {
         ogre = true;
        for(var p = 0; p < 200; p++)
        {

        var s = Math.random() * 10 + 1;
        particles.push({
          x: 400, 
          y: 300,
          w: s,
          h: s,
          dx: Math.random() - 0.5,
          dy: Math.random() - 0.5,
          ttl: Math.random() * 10,
          speed: BULLET_SPEED * 0.5 * Math.random(),
        })
      }
       }

     }
     if(click) {
       shoot(click.x, click.y);
     }
    }

     for(var i = particles.length - 1; i >= 0; i--) {
       particles[i].ttl -= delta;

       if(particles[i].ttl <= 0) {
         particles.splice(i, 1)
         continue;
       }

       particles[i].x += particles[i].dx * particles[i].speed * delta;
       particles[i].y += particles[i].dy * particles[i].speed * delta;
     }

 };

 draw = function(delta) {
     ctx.fillStyle = "#000000";
     ctx.fillRect(0, 0, c.width, c.height);

     ctx.fillStyle = "#fafafa";
     ctx.textAlign = "center";

     particles.forEach(function(particle) {
       ctx.fillRect(particle.x, particle.y, particle.w, particle.h);
     })

     ctx.fillStyle = "#ffffff";

     bullets.forEach(function(bullet) {
       ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
     })

     ctx.fillStyle = "#aaaaaa";

     ctx.fillRect(player.x, player.y, player.w, player.h);

     enemies.forEach(function(enemy) {
       ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
     })

        ctx.fillStyle = "#ffffff";
        ctx.font = "32px Visitor";
        ctx.fillText(Math.round(points), 400, 100);

     if(ogre) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "80px Visitor";
        ctx.fillText("oh no", 400, 350);
     }
 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

 loadImage = function(name, callback) {
    var img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded ' + name)
        images[name] = img
        loading -= 1
        if(callback) {
            callback(name);
        }
    }

    img.src = 'img/' + name + '.png'
 }



    // loadImage('tree');
    // loadImage('lemur');
    // loadImage('lemurf');

//  audios["jeb"] = new Audio('sounds/jeb.ogg');
//  audios["ultimate_jeb"] = new Audio("sounds/ultimate_jeb.ogg");

//  loadMusic("melody1");

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
