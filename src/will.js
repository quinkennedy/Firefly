var Will = function(x,y,index){
	return {
		id:"Will"+index,
		group:"will",
		tileset:"will",
		blinkfrequency:Math.random()*30+100,
		blinkcounter:Math.random()*100,
		x:x,
		y:y,
		nodiagonals:false,
		noreset:true,
		aggressivity:help.random(0,5),
		direction:help.random(0,9),//0=up, clockwise in 8 steps, -1 for stay still
		timetochange:20+help.random(0,21),
		initialize:function(){
			toys.topview.initialize(this,{
				frames:{standup:{frames:[0]}}});
		},
		first:function(){
			      this.timetochange--;
				var pl=gbox.getObject("player","player");
			      if (this.timetochange <= 0){
				      this.timetochange = 20+help.random(0,21);
				      if(help.random(0,this.aggressivity) == 0){//go towards player
					      var bMoveUp = pl.y < this.y-15;
					      var bMoveDown = pl.y > this.y + 15;
					      var bMoveLeft = pl.x < this.x - 15;
					      var bMoveRight = pl.x > this.x + 15;
					      if (bMoveUp && !bMoveLeft && !bMoveRight)
						      this.direction = 0;
					      else if(bMoveUp && bMoveRight)
						      this.direction = 1;
					      else if(bMoveRight && !bMoveDown)
						      this.direction = 2;
					      else if(bMoveRight)
						      this.direction = 3;
					      else if (bMoveDown && !bMoveLeft)
						      this.direction = 4;
					      else if (bMoveDown)
						      this.direction = 5;
					      else if (bMoveLeft && !bMoveUp)
						      this.direction = 6;
					      else if (bMoveLeft)
						      this.direction = 7;
					      else
						      this.direction = 8;
				      }else{//go randomly
					      this.direction = help.random(0,9);
				      }
			      }
			      this.blinkcounter = (this.blinkcounter+1)%this.blinkfrequency;
				//toys.topview.setStaticSpeed(this,.7) // Setting the moving speed.
				var straightSpeed = .7;
				var changeAmount = .01;
				var diagSpeed = Math.sqrt(Math.pow(straightSpeed,2)/2);
				var arrFunc = [function(obj){
					if(obj.accx < -changeAmount)obj.accx += changeAmount;
					else if(obj.accx > changeAmount)obj.accx -= changeAmount;
					else obj.accx = 0;
					obj.accy = Math.max(-straightSpeed, obj.accy-changeAmount);},
				    function(obj){
					obj.accx = Math.min(diagSpeed, obj.accx+changeAmount); 
					obj.accy = Math.max(-diagSpeed,obj.accy-changeAmount);},
				    function(obj){
					obj.accx = Math.min(straightSpeed, obj.accx+changeAmount); 
					if(obj.accy < -changeAmount)obj.accy += changeAmount;
				    	else if(obj.accy > changeAmount)obj.accy -= changeAmount;
				    	else obj.accy = 0;},
				    function(obj){
					    obj.accx = Math.min(diagSpeed, obj.accx+changeAmount); 
					    obj.accy = Math.min(diagSpeed, obj.accy+changeAmount);},
				    function(obj){
					if(obj.accx < -changeAmount)obj.accx += changeAmount;
					else if(obj.accx > changeAmount)obj.accx -= changeAmount;
					else obj.accx = 0;
					obj.accy = Math.min(straightSpeed, obj.accy+changeAmount);},
				    function(obj){
					    obj.accx = Math.max(-diagSpeed, obj.accx-changeAmount);
					    obj.accy = Math.min(diagSpeed, obj.accy+changeAmount);},
				    function(obj){
					    obj.accx = Math.max(-straightSpeed, obj.accx-changeAmount); 
					if(obj.accy < -changeAmount)obj.accy += changeAmount;
				    	else if(obj.accy > changeAmount)obj.accy -= changeAmount;
				    	else obj.accy = 0;},
				    function(obj){
					    obj.accx = Math.max(-diagSpeed, obj.accx-changeAmount);
					    obj.accy = Math.max(-diagSpeed, obj.accy-changeAmount);},
				    function(obj){
					if(obj.accx < -changeAmount)obj.accx += changeAmount;
					else if(obj.accx > changeAmount)obj.accx -= changeAmount;
					else obj.accx = 0; 
					if(obj.accy < -changeAmount)obj.accy += changeAmount;
				    	else if(obj.accy > changeAmount)obj.accy -= changeAmount;
				    	else obj.accy = 0;}];
				arrFunc[this.direction](this);

				//toys.topview.wander(this, maze, "map", 100, {speed:.7, minstep:1, steprange:20});
			      //toys.topview.handleAccellerations(this);
			      toys.topview.applyForces(this);
			      toys.topview.tileCollision(this,maze,"map",null);
			      if (gbox.collides(this,pl,2)) { // If we're colliding with capman, with a tolerance of 2 pixels...
					maingame.bullettimer=10; // ...stop the game for a while.
					pl.sleep();
				}	
		},
		/*kill:function(by){
			gbox.trashObject(this);
		},*/
		/*hitByBullet:function(by) {
			this.kill(); // Kill...
			var pl=gbox.getObject("player","player");
			pl.gotBug();
			return by.undestructable; // Destroy or not a bullet (decided by the bullet itself)
		},*/
		blit:function(){
			     gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:0, dx:this.x, dy:this.y, camera:this.camera, alpha:.9+(.1*Math.cos(Math.PI*(this.blinkcounter/this.blinkfrequency)*2))});
		}
	};
}
