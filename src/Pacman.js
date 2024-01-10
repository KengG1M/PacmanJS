import MovingDirection from "./MovingDirection.js";


export default class Pacman { 
    constructor (x,y,tileSize,velocity,tileMap){
        this.x=x;
        this.y=y;
        this.tileSize = tileSize;
        this.velocity=velocity;
        this.tileMap = tileMap;

        this.currentMovingDirection = null;
        this.requestedMovingDirection = null;

        this.pacmanAnimationTimerDefault = 10;
        this.pacmanAnimationTimer = null;

        this.pacmanRotation = this.Rotation.right;
        this.wakaSound = new Audio ('../sounds/waka.wav');

        this.powerDotSound = new Audio("sounds/power_dot.wav");
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
        this.timers =[];

        

        this.heartActive = false;
        this.heartAboutToExpire = false;
         this.timer1 = [];


        this.eatGhostSound = new Audio("sounds/eat_ghost.wav");

        this.madeFirstMove = false;

        document.addEventListener("keydown",this.#keydown);

        this.#loadPacmanImages();
        
    }

    Rotation = {
        right:0,
        down:1,
        left:2,
        up:3,
    }


    draw(ctx,pause, enemies){
        if (!pause) {
            this.#move();
            this.#animate();
        }
        this.#eatDot();
        this.#eatPowerDot();
        this.#eatHeart();
        this.velocityChange();
        this.#eatGhost(enemies);
        const size = this.tileSize/2;

        ctx.save();
        ctx.translate(this.x + size, this.y + size);
        ctx.rotate((this.pacmanRotation * 90 * Math.PI)/ 180);
        ctx.drawImage(
            this.pacmanImages[this.pacmanImageIndex],
            -size,
            -size,
            this.tileSize,
            this.tileSize
        );

        ctx.restore();



        //ctx.drawImage(this.pacmanImages[this.pacmanImageIndex],
            //this.x,
            //this.y,
            //this.tileSize,
            //this.tileSize)
    }

    #loadPacmanImages(){
        const pacmanImage1 = new Image(); // pacman close
        pacmanImage1.src="../images/pacman_0_0.png"

        const pacmanImage2 = new Image(); // pacman open
        pacmanImage2.src="../images/pacman_0_1.png"

        const pacmanImage3 = new Image();
        pacmanImage3.src="../images/pacman_0_2.png"

        const pacmanImage4 = new Image();
        pacmanImage4.src="../images/pacman_0_1.png"

        this.pacmanImages = [
            pacmanImage1, 
            pacmanImage2,
            pacmanImage3,
            pacmanImage4 
        ];

        this.pacmanImageIndex = 0;
    }

    #keydown =(event)=>{
        //up
        if(event.keyCode == 87){
            if(this.currentMovingDirection == MovingDirection.down)
            this.currentMovingDirection == MovingDirection.up;
            this.requestedMovingDirection = MovingDirection.up; //allow to move or not
            this.madeFirstMove = true;
        }
        //down
        if(event.keyCode == 83){
            if(this.currentMovingDirection == MovingDirection.up)
            this.currentMovingDirection == MovingDirection.down;
            this.requestedMovingDirection = MovingDirection.down;
            this.madeFirstMove = true;
        }
        //left
        if(event.keyCode == 65){
            if(this.currentMovingDirection == MovingDirection.right)
            this.currentMovingDirection == MovingDirection.left;
            this.requestedMovingDirection = MovingDirection.left;
            this.madeFirstMove = true;
        }
        //right
        if(event.keyCode == 68){
            if(this.currentMovingDirection == MovingDirection.left)
            this.currentMovingDirection == MovingDirection.right;
            this.requestedMovingDirection = MovingDirection.right;
            this.madeFirstMove = true;
        }

    };

    #move(){// check whether pacman can move or not
        if(this.currentMovingDirection !== this.requestedMovingDirection){
            if(Number.isInteger(this.x/this.tileSize) &&
                Number.isInteger(this.y/this.tileSize)
            ){
                if(!this.tileMap.didCollideWithEnvironment( //check wall collision
                    this.x, 
                    this. y,
                    this.requestedMovingDirection
                    )
                )
                this.currentMovingDirection = this.requestedMovingDirection;
            }
        }

        if(this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.currentMovingDirection
        ))
        {
            this.pacmanAnimationTimer = null;
            this.pacmanImageIndex = 1;
            return;

        }
        else if (
        this.currentMovingDirection != null &&
        this.pacmanAnimationTimer == null )
        {
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
        }

        switch(this.currentMovingDirection){
            case MovingDirection.up:
                this.y -= this.velocity;
                this.pacmanRotation = this.Rotation.up;
                break;
            case MovingDirection.down:
                this.y += this.velocity;
                this.pacmanRotation = this.Rotation.down;
                break;
            case MovingDirection.left:
                this.x -= this.velocity;
                this.pacmanRotation = this.Rotation.left;
                break;
            case MovingDirection.right:
                this.x += this.velocity;
                this.pacmanRotation = this.Rotation.right;
                break;
        }
    }

    #animate(){
        if(this.pacmanAnimationTimer == null ){
            return;
        }
        this.pacmanAnimationTimer--;
        if(this.pacmanAnimationTimer == 0){
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
            this.pacmanImageIndex++;
            if(this.pacmanImageIndex == this.pacmanImages.length)
            this.pacmanImageIndex = 0;
        }
    }

    #eatDot(){
        if(this.tileMap.eatDot(this.x,this.y)){
            //play sound
            
            //this.wakaSound.play();         
        }
    }

    


    #eatPowerDot() {
        if (this.tileMap.eatPowerDot(this.x, this.y)) {
          this.powerDotSound.play();
          this.powerDotActive = true;
          this.powerDotAboutToExpire = false;
          this.timers.forEach((timer) => clearTimeout(timer));
          this.timers = [];
    
          let powerDotTimer = setTimeout(() => {
            this.powerDotActive = false;
            this.powerDotAboutToExpire = false;
          }, 1000 * 6);
    
          this.timers.push(powerDotTimer);
    
          let powerDotAboutToExpireTimer = setTimeout(() => {
            this.powerDotAboutToExpire = true;
          }, 1000 * 3);
    
          this.timers.push(powerDotAboutToExpireTimer);
        }
      }


    
    
      #eatGhost(enemies) {
        if (this.powerDotActive) {
          const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
          collideEnemies.forEach((enemy) => {
            enemies.splice(enemies.indexOf(enemy), 1);
            this.eatGhostSound.play();
          });
        }
      }
      



  #eatHeart(){
    if(this.tileMap.eatHeart(this.x, this.y)){
        this.powerDotSound.play();
        
        this.heartActive = true;
        this.heartAboutToExpire =false;
        this.timer1.forEach((timer) => clearTimeout(timer));
        this.timer1 = [];

        let heartTimer = setTimeout(() => {
          
            this.heartActive = false;
            this.heartAboutToExpire= false;
            
          }, 1000 * 5);
    
          this.timer1.push(heartTimer);
    
          let heartAboutToExpireTimer = setTimeout(() => {
        
            this.heartAboutToExpire = true;
          }, 1000 * 3);
    
          this.timers.push(heartAboutToExpireTimer);


    }
  
}


velocityChange(){
    if(this.heartActive){
        this.velocity = 4;
    }else{
        this.velocity = 2;
    }
  }
}
