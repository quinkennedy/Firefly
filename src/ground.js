var Ground = function(x,y,name){
	return {
		id:"ground"+name,
		group:"ground",
		tileset:"tiles",
		x:x,
		y:y,
		split:1,
		tilesize:30,
		samplex:0,
		sampley:0,
		splitsamples:new Array(),
		initialize:function(){
			toys.topview.initialize(this,{
				frames:{standup:{frames:[0]}}});
			this.samplex = Math.random()*this.tilesize;
			this.sampley = Math.random()*this.tilesize;
			var step = this.tilesize / 3;
			for(var i = 0; i < 9; i++){
				this.splitsamples[i] = {x:Math.random()*step, y:Math.random()*step};
			}
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
				var lightInfo = getLightInfo();
				var myY = this.y + this.sampley;//this.tilesize / 2;
				var myX = this.x + this.samplex;//this.tilesize / 2;
				var myAmount, distance;

				distance = Math.sqrt(Math.pow(playerX-myX,2)+Math.pow(playerY-myY,2));
				distance /= 30;
				myAmount = (distance <= 1 ? lightInfo.amount : lightInfo.amount/Math.pow(distance,2));
				for(var entity in gbox._objects["bug"]){
					var b = gbox.getObject("bug", entity);
					distance = Math.sqrt(Math.pow(b.x+15-myX,2)+Math.pow(b.y+15-myY,2));
					distance /= 30;
					myAmount += (distance <= 1 ? b.brightness()*2 : b.brightness()*2/Math.pow(distance,3));
				}
				var bottomI = this.getBottomI(myAmount);
				this.actualblit(0,0,this.tilesize,bottomI,this.getRatio(myAmount));
				if (bottomI <= 8){
					var currSplit = 2;
					var splitsize = this.tilesize / currSplit;
					for(var h = 0; h < currSplit; h++){
						for(var v = 0; v < currSplit; v++){
							myY = this.y + (splitsize * h) + this.splitsamples[h*3+v].y;
							myX = this.x + (splitsize * v) + this.splitsamples[h*3+v].x;
							distance = Math.sqrt(Math.pow(playerX-myX,2)+Math.pow(playerY-myY,2));
							distance /= 30;
							myAmount = (distance <= 1 ? lightInfo.amount : lightInfo.amount/Math.pow(distance,2));
							for(var entity in gbox._objects["bug"]){
								var b = gbox.getObject("bug", entity);
								distance = Math.sqrt(Math.pow(b.x+15-myX,2)+Math.pow(b.y+15-myY,2));
								distance /= 30;
								myAmount += (distance <= 1 ? b.brightness()*2 : b.brightness()*2/Math.pow(distance,3));
							}
							var bottomI = this.getBottomI(myAmount);
							var ratio = this.getRatio(myAmount);
							if (ratio > 0 && bottomI <= 4){
								topI = bottomI - 1;
								if (bottomI == 4){
									bottomI = 10;
								}
								var xoffset = splitsize*v;
								var yoffset = splitsize*h;
								this.actualblit(xoffset,yoffset,splitsize, bottomI, ratio, topI);
							}
						}
					}
				}else{
				}
		},
		getBottomI:function(myAmount){
			return 9-(Math.min(9,Math.floor(myAmount/6)));
		},
		getRatio:function(myAmount){
			return (myAmount % 6)/6;
		},
		actualblit:function(xoffset, yoffset, size, bottomI, ratio, topI){
			if (bottomI < 10){
				gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:bottomI, dx:this.x + xoffset, dy:this.y + yoffset, camera:this.camera, offsetx:xoffset, offsety:yoffset, w:size, h:size});
			}
			if (bottomI > 0 && ratio > 0){
				if (!topI){
					topI = bottomI - 1;
				}
				//var size = ratio*30;
				//var offset = 15-Math.floor(size/2);
				gbox.blitTile(gbox.getBufferContext(),{alpha:ratio, tileset:this.tileset, tile:topI, dx:this.x + xoffset, dy:this.y + yoffset, offsetx:xoffset, offsety:yoffset, w:size, h:size, camera:this.camera});
				//gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset, tile:bottomI-1, dx:this.x + offset, dy:this.y + offset, camera:this.camera, offsetx:offset, offsety:offset, w:size, h:size});
			}
		}
	};
}
