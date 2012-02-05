function drawFade(indices,shapeFunc){
	var maps = getMaps();
	var main = getMain();
	var fades = getFades();
	var pl = gbox.getObject("player","player");
	var playerX = pl.x+pl.hw;//canv.width/2;
	var playerY = pl.y+pl.h-7;//canv.height/2;
	var lightInfo = getLightInfo();
	for(var i = 0; i < indices.length; i++){
		fades.ctx[indices[i]+1].clearRect(0,0,main.canv.width,main.canv.width);
		fades.ctx[indices[i]+1].setCompositeOperation("source-over");// = "source-in";
		if(!shapeFunc(fades.ctx[indices[i]+1], playerX, playerY, i, lightInfo.amount, main.canv.width, main.canv.height))
			continue;
		fades.ctx[indices[i]+1].setCompositeOperation("source-in");
		fades.ctx[indices[i]+1].drawImage(maps.canv[indices[i]],0, 0, main.canv.width, main.canv.height);
		fades.ctx[indices[i]+1].setCompositeOperation("source-over");
	}
	var x = pl.x - fadeSetX;
	var y = pl.y - fadeSetY;
	var w = main.canv.width;
	var h = main.canv.height;
	for(var i = indices.length - 1; i >= 0; i--){
		//if (lightType == 5){
			//arrFadeCtx[i].putImageData(arrFade[i],x,y);
		//}
		gbox.blit(gbox.getBufferContext(),fades.canv[indices[i]+1],{dx:0,dy:0,dw:w,dh:h,sourcecamera:true});
	}
	fadeSetX = pl.x;
	fadeSetY = pl.y;
}
function setUpFadeCanvases(){
	gbox.createCanvas("fade",{w:maze1.w,h:maze1.h});
}
function getFades(){
	var canv=[gbox.getCanvas("fade")];
	var ctx=[canv[0].getContext("2d")];
	var img=[ctx[0].getImageData(0,0,canv[0].width,canv[0].height)];
	var data=[img[0].data];
	return {canv:canv,
		ctx:ctx,
		img:img,
		data:data};
}
function simpleHardBetween(alphaFunc){
	var maps = getMaps();
	var main = getMain();
	var lightInfo = getLightInfo();
	var pl = gbox.getObject("player","player");
	var playerX = pl.x+pl.hw;//canv.width/2;
	var playerY = pl.y+pl.h-7;//canv.height/2;
	var currX = 0;
	var currY = 0;

	for(var i = 0; i < main.data.length; i+= 4){
		var dist = Math.sqrt(Math.pow((currX-playerX),2)+Math.pow((currY-playerY)*1.4,2));
		var idx = -1;
		if (dist < (lightInfo.amount - 20) * 10){
			idx = 0;
		}else if (dist < (lightInfo.amount - 15)*10){
			idx = 1;
		}else if (dist < (lightInfo.amount - 10)*10){
			idx = 2;
		}else if (dist < (lightInfo.amount - 5)*10){
			idx = 3;
		}else if (dist < lightInfo.amount*10){
			idx = 4;
		}

		if (idx >=0){
			main.data[i]=maps.data[idx][i];
			main.data[i+1] = maps.data[idx][i+1];
			main.data[i+2] = maps.data[idx][i+2];
			main.data[i+3] = alphaFunc(dist,lightInfo.amount);
		}else {
			main.data[i+3] = 0;
		}

		if (currX >= main.canv.width - 1){
			currY++;
			currX = 0;
		} else {
			currX++;
		}
	}
 	main.ctx.putImageData(main.img,0,0);
	gbox.blit(gbox.getBufferContext(),main.canv,{dx:0,dy:0,dw:main.canv.width,dh:main.canv.height,sourcecamera:true}); // Simply draw the maze on the screen.
}
function getLightInfo(){
	var pl = gbox.getObject("player","player");
	var bLightChanged = lightData != pl.bugs;
	if (bLightChanged){
		if (lightData > pl.bugs){
			lightData = pl.bugs;
		}else{
			lightData += .3;
			if (lightData > pl.bugs){
				lightData = pl.bugs;
			}
		}
		fadeSetX = pl.x;
		fadeSetY = pl.y;
	}
	return{changed:bLightChanged,
		amount:lightData
	};
}

function getMain(){
	var canv=gbox.getCanvas("mazecanvas");
	var ctx=canv.getContext("2d");
	var img=ctx.getImageData(0,0,canv.width,canv.height);
	var data=img.data;
	return{canv:canv,
		ctx:ctx,
		img:img,
		data:data};
}
function getMaps(){
	var canv=[gbox.getCanvas("mazeCanvas1"),
		gbox.getCanvas("mazeCanvas2"),
		gbox.getCanvas("mazeCanvas3"),
		gbox.getCanvas("mazeCanvas4"),
		gbox.getCanvas("mazeCanvas5")];
	var ctx=[canv[0].getContext("2d"),
		canv[1].getContext("2d"),
		canv[2].getContext("2d"),
		canv[3].getContext("2d"),
		canv[4].getContext("2d")];
	var img=[ctx[0].getImageData(0,0,canv[0].width,canv[0].height),
		ctx[1].getImageData(0,0,canv[1].width,canv[1].height),
		ctx[2].getImageData(0,0,canv[2].width,canv[2].height),
		ctx[3].getImageData(0,0,canv[3].width,canv[3].height),
		ctx[4].getImageData(0,0,canv[4].width,canv[4].height)];
	var data=[img[0].data,
		img[1].data,
		img[2].data,
		img[3].data,
		img[4].data];
	return {canv:canv,
		ctx:ctx,
		img:img,
		data:data};
}
