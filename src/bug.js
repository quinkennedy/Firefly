var Bug = function(x,y,index){
	return {
		id:"Bug"+index,
		group:"bug",
		tileset:"bug",
		blinkfrequency:Math.random()*30+100,
		blinkcounter:Math.random()*100,
		x:x,
		y:y,
		initialize:function(){
			toys.topview.initialize(this,{
				frames:{standup:{frames:[0]}}});
		},
		first:function(){
			      this.blinkcounter = (this.blinkcounter+1)%this.blinkfrequency;
			      toys.topview.wander(this, maze, "map", 100, {speed:.1, minstep:1, steprange:20});
			      toys.topview.handleAccellerations(this);
			      toys.topview.handleGravity(this);
			      toys.topview.applyForces(this);
			      toys.topview.applyGravity(this);
			      toys.topview.tileCollision(this,maze,"map",null);
			      toys.topview.floorCollision(this);
			      toys.topview.adjustZindex(this);
		},
		kill:function(by){
			gbox.trashObject(this);
		},
		hitByBullet:function(by) {
			this.kill(); // Kill...
			var pl=gbox.getObject("player","player");
			pl.gotBug();
			return by.undestructable; // Destroy or not a bullet (decided by the bullet itself)
		},
		blit:function(){
			     //gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:1, dx:this.x, dy:this.y, camera:this.camera, alpha:1});
			     gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:0, dx:this.x, dy:this.y, camera:this.camera, alpha:Math.pow((Math.cos(Math.PI*(this.blinkcounter/this.blinkfrequency)*2)+1)/2,6)});
		}
	};
}
