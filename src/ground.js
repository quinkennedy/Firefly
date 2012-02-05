var Ground = function(x,y,name){
	return {
		id:"ground"+name,
		group:"ground",
		tileset:"tiles",
		x:x,
		y:y,
		initialize:function(){
			toys.topview.initialize(this,{
				frames:{standup:{frames:[0]}}});
		},
		first:function(){
			      toys.topview.handleAccellerations(this);
			      toys.topview.applyForces(this);
			      toys.topview.tileCollision(this,maze,"map",null);
		},
		blit:function(){
				var pl=gbox.getObject("player","player");
				var playerX = pl.x+pl.hw;//canv.width/2;
				var playerY = pl.y+pl.h-7;//canv.height/2;
				var myX = this.x + 15;
				var myY = this.y + 15;
				var distance = Math.sqrt(Math.pow(playerX-myX,2)+Math.pow(playerY-myY,2));
				distance /= 30;
				var lightInfo = getLightInfo();
				var myAmount = (distance <= 1 ? lightInfo.amount : lightInfo.amount/Math.pow(distance,2));
				for(var entity in gbox._objects["bug"]){
					var b = gbox.getObject("bug", entity);
					distance = Math.sqrt(Math.pow(b.x+15-myX,2)+Math.pow(b.y+15-myY,2));
					distance /= 30;
					myAmount += (distance <= 1 ? b.brightness() : b.brightness()/Math.pow(distance,2));
				}
				var bottomI = 9-(Math.min(9,Math.floor(myAmount/6)));
				var ratio = (myAmount % 6)/6;
				if (bottomI < 10){
					gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:bottomI, dx:this.x, dy:this.y, camera:this.camera});
				}
				if (bottomI > 0 && ratio > 0){
					var size = ratio*30;
					var offset = 15-Math.floor(size/2);
					gbox.blitTile(gbox.getBufferContext(),{alpha:ratio, tileset:this.tileset, tile:bottomI-1, dx:this.x, dy:this.y, camera:this.camera});
					//gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:bottomI-1, dx:this.x + offset, dy:this.y + offset, camera:this.camera, offsetx:offset, offsety:offset, w:size, h:size});
				}
		}
	};
}
