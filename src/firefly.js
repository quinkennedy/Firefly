// ---
// Copyright (c) 2010 Francesco Cottone, http://www.kesiev.com/
// ---

	// Hello! If you're thinking that the "Capman" demo was the easier... you're wrong ;) Well... at least is the most documented. So, let's travel between
	// the "player"'s code. I'll be quite informal... forgive me!
	// Ow! First of all, play player a bit, paying attention on what happens on the screen: how ghosts moves, how player is controlled etc. Done? Ok. Let's go.

		  // These objects will be reachable everywhere. Usually are the levels, the dialogues and the maingame object.
		  var maingame; // The magic object that handles the full play cycle
		  var maze,maze1,maze2,maze3,maze4,maze5; // The maze array, with pills and walls
		var arrPieces = [0];//[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,11,11];
		//I think this is the smallest map I can do with this setup, we will use this for testing for now
				var totalCells = 13//11*2+1;//Math.pow(2, 52);
				var xMin = 0;
				var xMax = 12;//11*2-1;
				var yMin = 0;
				var yMax = 10;//9*2-1;
				var seed = new Date();
				var bugP = .05;
				var willP = .01;
				var willIndex = 0;
				var bugIndex = 0;
				var baseURL, basePicURL;
				var m_bDebug = false;
				var lightType = 8;//1 = hard edges, 2 = cos fading between, 3 = cos fading overall w/ hard edges between, 4 = cos fading between (2 levels only), 5 = like 2 but diff implementation, 6= hard squares, 7 = cos between (using gradients),8 = indiv squares

				var lightData = 0;
				//var arrFade;
				var fadeSetX = 0;
				var fadeSetY = 0;

		function actualURL(input){
			var ending = input.substr(input.length - 3);
			return (ending == 'png' && basePicURL != undefined ? basePicURL : (baseURL != undefined ? baseURL : '')) + input;
		}

		// First of all, let's load all the needed resources. Is done on the "onLoad" event of the window.
		gbox.onLoad(function () {
			help.akihabaraInit({ // Akihabara is initialized with title and all the default settings.
				title:"Firefly", // ... Just changing the game title...
				splash:{footnotes:["Art Director: David Frankel, Programming: Quin Kennedy", "etc: David Frankel & Quin Kennedy","Contact us: quinkennedy@gmail.com"], 
				background:actualURL("resources/splash.png"),
				minimalTime:0}//custom splash screen
			});

			gbox.addBundle({file:"resources/bundle.js"/*actualURL("resources/bundle.js")*/});//load resources, if you do it this way, then the splash screen shows while loading other resources

			gbox.loadAll(go); // When everything is ready, the "loadAll" downloads all the needed resources and runs the "go" function when it's done loading.

		}, false);

		  function go() {

		  	// The very first thing to do is to set which groups will be involved in the game. Groups can be used for grouped collision detection and for rendering order
		 	gbox.setGroups(["background","ground","player","sparks","bug","will","playerbullets","gamecycle"]); // Usually the background is the last thing rendered. The last thing is "gamecycle", that means games messages, like "gameover", menus etc.
		 	gbox.setAudioChannels({bgmusic:{volume:0.8},sfx:{volume:1.0}}); // If we're going to add audio to our game, we have to create virtual channels. Channels acts like groups but for audio: audio on the same channels can be stopped together and shares the same highest volume.


		 	maingame=gamecycle.createMaingame("gamecycle","gamecycle"); // We create a new maingame into the "gamecycle" group. Will be called "gamecycle". From now, we've to "override" some of the maingame default actions.


		   // This method is called every new level. That is called also for the first level, so...
		  maingame.changeLevel=function(level) {
		  		// The first time the "changeLevel" is called, level is NULL. Our first stage is "1", so...
		  		if (level==null) level=1;
		  		// We need to store this number somewhere, since is needed to define which is the next level.
		  		maingame.level=level; // "maingame" is handy enough to store some game data.
		  		//maingame.hud.setValue("stage","value","STAGE "+level); // Put on the screen the stage name (I'll explain what the "hud" is in the "initializeGame" function)



				// Then, we need to count the number of pills to eat... quite crucial, to define when the maze was cleared. Since we're lazy, we're going to cycle the map and increase a counter instead of counting them by hand.


				this.newLife(); // We will call the local "newLife" method, since this came displaces enemies and player every new level. Do you remember this in player? ;)
		  }

		  // This event is triggered every time the player "reborn". As you've seen, is manually called in the last line of "changelevel"
		  maingame.newLife=function(up) {
		  	// Let's clean up the level from the ghosts, sparks (visual effects like explosions - in player are sparks the earned points messages) and left bonuses, if any.
		  	gbox.trashGroup("bug");
		  	gbox.trashGroup("will");
			gbox.trashGroup("sparks");
		  	gbox.purgeGarbage(); // the gbox module have a garbage collector that runs sometime. Let's call this manually, for optimization (and better reinitialization)
			willIndex = bugIndex = 0;
			var pl = gbox.getObject("player","player");
			toys.topview.spawn(pl,{accx:0,accy:0,xpushing:false,ypushing:false}); 
			var xCurr = xMin;
			var yCurr = yMin;
			if (m_bDebug){
				maingame.hud.setValue("xMinAc","value",leadingZeros(xCurr,2));
				maingame.hud.setValue("yMinAc","value",leadingZeros(yCurr,2));
			}
			var plXfloor = (pl.x/30)>>>0;
			var plYfloor = (pl.y/30)>>>0;
			var plXceil = Math.ceil(pl.x/30);
			var plYceil = Math.ceil(pl.x/30);
			for(var i = 0; i < maze1.map[0].length; i++){
				yCurr = yMin;
				for(var j = 0; j < maze1.map.length; j++){
					if (i < plXfloor - 1 || i > plXceil + 1 || j < plYfloor - 1 || j > plYceil + 1){
						var rand = Alea(seed, xCurr, yCurr);
						rand();//trash the first one since that was used to create the grid cell
						addEntities(rand,i,j);
					}
					yCurr = (yCurr + 1) % totalCells;
				}
				xCurr = (xCurr + 1) % totalCells;
			}
			if (m_bDebug){
				maingame.hud.setValue("xMaxAc","value",leadingZeros(xCurr,2));
				maingame.hud.setValue("yMaxAc","value",leadingZeros(yCurr,2));
			}
			//gbox.playAudio("background"); // Start playing the ingame music. Notes that the "maingame" object will fade in/out and stop the "bgmusic" channel when the screen will fade automatically. We just need to play the music when the screen is fading to fade the music too!
		  }


		// This method is called before starting the game, after the startup menu. Everything vital is done here, once per play.
		maingame.initializeGame=function() {

			// Maingame gives an "hud" object that is rendered over everything. Really useful for indicators, like score, lives etc. The first thing we do is to populate this object.
			if (m_bDebug){
				maingame.hud.setWidget("xMin",{widget:"label",font:"small",value:leadingZeros(xMin,2),dx:20,dy:10,clear:true});
				maingame.hud.setWidget("xMax",{widget:"label",font:"small",value:leadingZeros(xMax,2),dx:20,dy:20,clear:true});
				maingame.hud.setWidget("yMin",{widget:"label",font:"small",value:leadingZeros(yMin,2),dx:20,dy:30,clear:true});
				maingame.hud.setWidget("yMax",{widget:"label",font:"small",value:leadingZeros(yMax,2),dx:20,dy:40,clear:true});

				maingame.hud.setWidget("xMinAc",{widget:"label",font:"small",value:0,dx:200,dy:10,clear:true});
				maingame.hud.setWidget("xMaxAc",{widget:"label",font:"small",value:0,dx:200,dy:20,clear:true});
				maingame.hud.setWidget("yMinAc",{widget:"label",font:"small",value:0,dx:200,dy:30,clear:true});
				maingame.hud.setWidget("yMaxAc",{widget:"label",font:"small",value:0,dx:200,dy:40,clear:true});
				//maingame.hud.setWidget("bugIndex",{widget:"label",font:"small",value:bugIndex,dx:20,dy:20,clear:true});
			}
			//maingame.hud.setWidget("label",{widget:"label",font:"small",value:"1UP",dx:240,dy:10,clear:true}); // This is a classic "1UP" static label. Unuseful but really retro!
			//maingame.hud.setWidget("score",{widget:"label",font:"small",value:0,dx:240,dy:25,clear:true}); // A score counter. This not only is a displayed value but will really keep the player's score.
			//maingame.hud.setWidget("label",{widget:"label",font:"small",value:"HI",dx:240,dy:40,clear:true}); // The "HI" label. Becouse "HI" is more retro.
			//maingame.hud.setWidget("hiscore",{widget:"label",font:"small",value:0,dx:240,dy:55,clear:true}); // The hiscore counter. This one will be just used for displaying.

			//maingame.hud.setWidget("lives",{widget:"symbols",minvalue:0,value:3-maingame.difficulty,maxshown:3,tileset:"player",tiles:[5],dx:240,dy:70,gapx:16,gapy:0}); // The classic life indicator, with repated player symbols. Note the "difficulty usage" ;)

			//maingame.hud.setValue("hiscore","value",gbox.dataLoad("player-hiscore")); // setValue is used to set parametes on hud. So, well, we're setting the "hiscore value" to the loaded data "player-hiscore" that contains the latest hiscore.

			// An object will draw the maze on the screen
			 gbox.addObject({
				id:"bg", // This is the object ID
				group:"background", // Is in the "backround" group, that is the lower group in the "setGroups" list. Will be drawn for first.
				//initialize:function() { // This action is executed the first time the object is called, so...
					//gbox.setCameraY(0,{w:maze.w,h:maze.h}); // We place the camera a bit down, since the full maze doesn't fit the screen.
				//},
				blit:function() { // Then, the most important action: the "blit", where object are drawn on the screen.
					var pl = gbox.getObject("player","player");
					gbox.centerCamera(pl,{w:maze1.w,h:maze1.h});
					gbox.blitFade(gbox.getBufferContext(),{alpha:1}); // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
					if (lightType == 8){return;}
					if (lightType == 1 || lightType == 3 || lightType == 6 || lightType == 7){
						DrawTypes[lightType == 1 ? 0 : lightType == 3 ? 1 : lightType == 6 ? 2 : 3].blit();
						return;
					}

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
					var canv = gbox.getCanvas("mazecanvas");
					var ctx = canv.getContext("2d");
					var imgd = ctx.getImageData(0,0,canv.width,canv.height);
					var result = imgd.data;
					var arrSrcImg = [gbox.getCanvas("mazeCanvas1"),
					    		gbox.getCanvas("mazeCanvas2"),
					    		gbox.getCanvas("mazeCanvas3"),
					    		gbox.getCanvas("mazeCanvas4"),
					    		gbox.getCanvas("mazeCanvas5")];
					var src = [gbox.getCanvas("mazeCanvas1").getContext("2d").getImageData(0,0,canv.width,canv.height).data,
					 		gbox.getCanvas("mazeCanvas2").getContext("2d").getImageData(0,0,canv.width,canv.height).data,
							gbox.getCanvas("mazeCanvas3").getContext("2d").getImageData(0,0,canv.width,canv.height).data,
							gbox.getCanvas("mazeCanvas4").getContext("2d").getImageData(0,0,canv.width,canv.height).data,
							gbox.getCanvas("mazeCanvas5").getContext("2d").getImageData(0,0,canv.width,canv.height).data];
					var fade,fadeCtx,fadeD;
					var arrFadeCanv,arrFade,arrFadeCtx,arrFadeD;
					if (lightType == 2 || lightType == 4 || lightType == 5 || lightType == 6){
						fadeCtx = gbox.getCanvas("fade").getContext("2d");
						fade = fadeCtx.getImageData(fadeSetX-pl.x,fadeSetY-pl.y,canv.width,canv.height);
						fadeD = fade.data;
						arrFadeCanv = [gbox.getCanvas("fade1"),
							    gbox.getCanvas("fade2"),
							    gbox.getCanvas("fade3"),
							    gbox.getCanvas("fade4"),
							    gbox.getCanvas("fade5")]
						arrFadeCtx = [arrFadeCanv[0].getContext("2d"),
							    arrFadeCanv[1].getContext("2d"),
							    arrFadeCanv[2].getContext("2d"),
							    arrFadeCanv[3].getContext("2d"),
							    arrFadeCanv[4].getContext("2d")];
						var x = 0;//fadeSetX-pl.x;
						var y = 0;//fadeSetY-pl.y;
						var w = canv.width;
						var h = canv.height;
						arrFade = [arrFadeCtx[0].getImageData(x,y,w,h),
							arrFadeCtx[1].getImageData(x,y,w,h),
							arrFadeCtx[2].getImageData(x,y,w,h),
							arrFadeCtx[3].getImageData(x,y,w,h),
							arrFadeCtx[4].getImageData(x,y,w,h)];
						arrFadeD = [arrFade[0].data,
							 arrFade[1].data,
							 arrFade[2].data,
							 arrFade[3].data,
							 arrFade[4].data];
					}
					var playerX = pl.x+pl.hw;//canv.width/2;
					var playerY = pl.y+pl.h-7;//canv.height/2;
					var currX = 0;
					var currY = 0;
					var dist;
					if (lightType == 6){
						for(var i = 0; i < arrFade.length; i++){
							arrFadeCtx[i].setCompositeOperation("source-over");// = "source-in";
							arrFadeCtx[i].fillRect(playerX - (20*i), playerY - (20*i), (40*i), (40*i));
							arrFadeCtx[i].setCompositeOperation("source-in");
							arrFadeCtx[i].drawImage(arrSrcImg[i],0, 0, canv.width, canv.height);
							arrFadeCtx[i].setCompositeOperation("source-over");
						}
					} else {
					for(var i = 0; i < result.length; i+= 4){
						dist = Math.sqrt(Math.pow((currX-playerX),2)+Math.pow((currY-playerY)*1.4,2));
						switch (lightType){
							case 2:
							case 4:
								var func = function(destination,index,source1,source2,ratio){
									destination[index] = source1[index] * ratio + (source2 ? (source2[index] * (1-ratio)) : 0);
									destination[index + 1] = source1[index + 1] * ratio + (source2 ? (source2[index + 1] *  (1-ratio)) : 0);
									destination[index + 2] = source1[index + 2] * ratio + (source2 ? (source2[index + 2] *  (1-ratio)) : 0);
									destination[index + 3] = 255;
								};
								if (dist < lightData * 10){
									if (lightType == 4){
										if (dist > (lightData - 15) * 10){
											//dim 4 -> black
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 15),0) * 10))*Math.PI/150)/2+.5;
												fadeD[i+3] = (r * 255)>>>0;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[3],null,r);
										} else if (dist > (lightData - 20) * 10){
											//fully 4
											func(result,i,src[3],null,1);
										} else if (dist > (lightData - 35) * 10){
											//dim 1 -> 4
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 35),0) * 10))*Math.PI/150)/2+.5;
												fadeD[i+3] = (r * 255)>>>0;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[0],src[3],r);
										} else {
											//fully 1;
											func(result,i,src[0],null,1);
										}
									} else {
										if (dist > (lightData-4) * 10){
											//dim 5 -> black
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 4),0) * 10))*Math.PI/40)/2+.5;
												fadeD[i+3] = (r * 255)>>>0;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[4],null,r);
										} else if (dist > (lightData - 5) * 10){
											//fully 5;
											func(result,i,src[4],null,1);
										} else if (dist > (lightData - 9) * 10){
											//dim 4 -> 5
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 9),0) * 10))*Math.PI/40)/2+.5;
												fadeD[i+3] = r * 255;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[3],src[4],r);
										} else if (dist > (lightData - 10) * 10){
											//fully 4
											func(result,i,src[3],null,1);
										} else if (dist > (lightData - 14) * 10){
											//dim 3 -> 4
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 14),0) * 10))*Math.PI/40)/2+.5;
												fadeD[i+3] = r * 255;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[2],src[3],r);
										} else if (dist > (lightData - 15) * 10){
											//fully 3
											func(result,i,src[2],null,1);
										} else if (dist > (lightData - 19) * 10){
											//dim 2 -> 3
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 19),0) * 10))*Math.PI/40)/2+.5;
												fadeD[i+3] = r * 255;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[1],src[2],r);
										} else if (dist > (lightData - 20) * 10){
											//fully 2
											func(result,i,src[1],null,1);
										} else if (dist > (lightData - 24) * 10){
											//fully 1 -> 2
											var r;
											if (bLightChanged){
												r = Math.cos((dist - (Math.max((lightData - 24),0) * 10))*Math.PI/40)/2+.5;
												fadeD[i+3] = r * 255;
											} else {
												r = fadeD[i+3]/255;
											}
											func(result,i,src[0],src[1],r);
										} else if (dist > (lightData - 25) * 10){
											//fully 1
											func(result,i,src[0],null,1);
										}
									}
								} else {
									result[i+3] = 0;
								}
								break;
							case 5:
								if (dist < lightData * 10){
									var idx1,idx2,value;
									if (dist > (lightData-4) * 10){
										//dim 5 -> black
										if (bLightChanged){
											value = Math.cos((dist - (Math.max((lightData - 4),0) * 10))*Math.PI/40)/2+.5;
											value *= 255;
										}
										idx1 = 4;
										idx2 = null;
									} else if (dist > (lightData - 5) * 10){
										//fully 5;
										value = 255;
										idx1 = 4;
										idx2 = null;
									} else if (dist > (lightData - 9) * 10){
										//dim 4 -> 5
										if (bLightChanged){
											value = Math.cos((dist - (Math.max((lightData - 9),0) * 10))*Math.PI/40)/2+.5;
											value *= 255;
										}
										idx1 = 3;
										idx2 = 4;
									} else if (dist > (lightData - 10) * 10){
										//fully 4
										value = 255;
										idx1 = 3;
										idx2 = null;
									} else if (dist > (lightData - 14) * 10){
										//dim 3 -> 4
										if (bLightChanged){
											value = Math.cos((dist - (Math.max((lightData - 14),0) * 10))*Math.PI/40)/2+.5;
											value *= 255;
										}
										idx1 = 2;
										idx2 = 3;
									} else if (dist > (lightData - 15) * 10){
										//fully 3
										value = 255;
										idx1 = 2;
										idx2 = null;
									} else if (dist > (lightData - 19) * 10){
										//dim 2 -> 3
										if (bLightChanged){
											value = Math.cos((dist - (Math.max((lightData - 19),0) * 10))*Math.PI/40)/2+.5;
											value *= 255;
										}
										idx1 = 1;
										idx2 = 2;
									} else if (dist > (lightData - 20) * 10){
										//fully 2
										value = 255;
										idx1 = 1;
										idx2 = null
									} else if (dist > (lightData - 24) * 10){
										//fully 1 -> 2
										if (bLightChanged){
											value = Math.cos((dist - (Math.max((lightData - 24),0) * 10))*Math.PI/40)/2+.5;
											value *= 255;
										}
										idx1 = 0;
										idx2 = 1;
									} else if (dist > (lightData - 25) * 10){
										//fully 1
										value = 255;
										idx1 = 0;
										idx2 = null;
									}

									if(bLightChanged){
										arrFadeD[idx1][i+3] = value;
									}
									arrFadeD[idx1][i] = src[idx1][i];
									arrFadeD[idx1][i+1] = src[idx1][i+1];
									arrFadeD[idx1][i+2] = src[idx1][i+2];
									if (idx2){
										if (bLightChanged){
											arrFadeD[idx2][i+3] = 255;
										}
										arrFadeD[idx2][i] = src[idx2][i];
										arrFadeD[idx2][i+1] = src[idx2][i+1];
										arrFadeD[idx2][i+2] = src[idx2][i+2];
									}	
								}
								break;
						}

						if (currX >= canv.width - 1){
							currY++;
							currX = 0;
						} else {
							currX++;
						}
					}
					}

					if ((lightType == 2 || lightType == 4 || lightType == 5) && bLightChanged){
						fadeCtx.putImageData(fade,fadeSetX-pl.x,fadeSetY-pl.y);
					}
					if (lightType == 5 || lightType == 6){
						var x = pl.x - fadeSetX;
						var y = pl.y - fadeSetY;
						var w = canv.width;
						var h = canv.height;
						for(var i = arrFade.length - 1; i >= 0; i--){
							if (lightType == 5){
								arrFadeCtx[i].putImageData(arrFade[i],x,y);
							}
							gbox.blit(gbox.getBufferContext(),arrFadeCanv[i],{dx:0,dy:0,dw:w,dh:h,sourcecamera:true});
						}
						fadeSetX = pl.x;
						fadeSetY = pl.y;
					} else {
			 			ctx.putImageData(imgd,0,0);
						gbox.blit(gbox.getBufferContext(),canv,{dx:0,dy:0,dw:canv.width,dh:canv.height,sourcecamera:true}); // Simply draw the maze on the screen.
					}
				}
			  });


				var arrMap = new Array();
				var xCurr = 0;
				var yCurr = 0;
				for(; yCurr <= yMax; yCurr++){//visible is just under 11 x 9
					arrMap[yCurr] = new Array();
					for(xCurr = 0; xCurr <= xMax; xCurr++){
						arrMap[yCurr][xCurr] = arrPieces[Alea(seed,xCurr, yCurr)()*arrPieces.length>>>0/*help.random(0,arrPieces.length)*/];
						if (lightType == 8){
							maingame.addGround(xCurr*30,yCurr*30,""+xCurr+":"+yCurr);
						}
					}
				}
				// Let's prepare the maze map now. Every stage is the same level but you can generate a new level each "changeLevel" call, using the "level" argument value.
				// This is just an array with the tile id or NULL for an empty transparent space.
				/*maze=help.finalizeTilemap({ // finalizeTilemap does some magic to the maze object: calculate real width/height of the map in pixels and values the "h" and "w" property.
					tileset:"tiles", // This is the tileset used for rendering the map.
					map:arrMap,
					tileIsSolid:function(obj,t){ // This function have to return true if the object "obj" is checking if the tile "t" is a wall, so...
							return false;/*t==null || *///(obj.group != 'bug' && obj.group != 'will' && t!==0);
				/*	}

				 });*/
				

				maze1=help.finalizeTilemap({tileset:"tiles1",map:arrMap,tileIsSolid:function(){return false;}});
				gbox.createCanvas("mazeCanvas1",{w:maze1.w,h:maze1.h});
				gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas1"), maze1);
				maze2=help.finalizeTilemap({tileset:"tiles2",map:arrMap,tileIsSolid:function(){return false;}});
				gbox.createCanvas("mazeCanvas2",{w:maze1.w,h:maze1.h});
				gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas2"), maze2);
				maze3=help.finalizeTilemap({tileset:"tiles3",map:arrMap,tileIsSolid:function(){return false;}});
				gbox.createCanvas("mazeCanvas3",{w:maze1.w,h:maze1.h});
				gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas3"), maze3);
				maze4=help.finalizeTilemap({tileset:"tiles4",map:arrMap,tileIsSolid:function(){return false;}});
				gbox.createCanvas("mazeCanvas4",{w:maze1.w,h:maze1.h});
				gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas4"), maze4);
				maze5=help.finalizeTilemap({tileset:"tiles5",map:arrMap,tileIsSolid:function(){return false;}});
				gbox.createCanvas("mazeCanvas5",{w:maze1.w,h:maze1.h});
				gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas5"), maze5);

				if (lightType == 1 || lightType == 3 || lightType == 6 || lightType == 7){
					DrawTypes[lightType == 1 ? 0 : lightType == 3 ? 1 : lightType == 6 ? 2 : 3].init();
				}else{
				if (lightType == 2 || lightType == 4 || lightType == 5 || lightType == 6){
					//arrFade = new Array();
					gbox.createCanvas("fade",{w:maze1.w,h:maze1.h});
					gbox.createCanvas("fade1",{w:maze1.w,h:maze1.h});
					gbox.createCanvas("fade2",{w:maze1.w,h:maze1.h});
					gbox.createCanvas("fade3",{w:maze1.w,h:maze1.h});
					gbox.createCanvas("fade4",{w:maze1.w,h:maze1.h});
					gbox.createCanvas("fade5",{w:maze1.w,h:maze1.h});
				}
				}
				gbox.createCanvas("mazecanvas",{w:maze1.w,h:maze1.h}); // Since finalizeMap have calculated the real height and width, we can create a canvas that fits perfectly our maze... Let's call it "mazecanvas".
				//gbox.blitTilemap(gbox.getCanvasContext("mazecanvas"),maze); // Let's paste the maze map in the "maze" object into the just created "mazecanvas". So is now ready to be rendered.

			// Now, let's add our player. The player is usually added once per match and "moved" in the map on level changes (as you've seen into the newLife method)
			 var pl = new Player();
			 pl.x = maze1.hw;
			 pl.y = maze1.hh;
			gbox.addObject(pl);
	 	 }

		function addEntities(rand,x,y){
			if (rand() < willP){
				maingame.addWill(x*30,y*30,willIndex++);
			}
			var num = rand();
			if (num < bugP){
				maingame.addBug(x*30,y*30,bugIndex++);
				if (num < bugP*.6){
					maingame.addBug(x*30,y*30,bugIndex++);
					if (num < bugP*.6*.6){
						maingame.addBug(x*30,y*30,bugIndex++);
						if (num < bugP*.6*.6*.6)
							maingame.addBug(x*30,y*30,bugIndex++);
					}
				}
			}
		}

		maingame.addBug = function(x, y, index){
			var bug = gbox.addObject(new Bug(x, y, index));
			return bug;
		}

		maingame.addWill = function(x,y,index){
			return;//we will include wills later
			var will = gbox.addObject(new Will(x, y, index));
			return will;
		}

		maingame.addGround = function(x,y,name){
			return gbox.addObject(new Ground(x,y,name));
		}

	 	 // Some final touch to the maingame object...
		  maingame.gameIsOver=function() { // This method is called by maingame itself to check if the game is over or not. So...
		  	/*var isGameover=maingame.hud.getValue("lives","value")==0; // the game is REALLY over when lives counter reaches the zero.
		  	if (isGameover) // Just in time, we can do something useful, since we're here. Like... checking if we have a new *CAPMAN CHAMPION*...
		  		if (maingame.hud.getNumberValue("score","value")>maingame.hud.getNumberValue("hiscore","value")) // If the player's score is higher the shown hiscore...
		  			gbox.dataSave("player-hiscore",maingame.hud.getNumberValue("score","value")); // ... save the player's score as new hiscore. The next time we play "player", the new hiscore to beat will be this one.
		  	return isGameover; // Finally, returning if the game is ended or not.
		  */return false;}

		 maingame.gameEvents=function() { 
			 var shiftAmount = 1;//number of tiles to shift when player gets near edge
			 var shiftPixels = 30*shiftAmount;
			 var xShift = 0;
			 var yShift = 0;
			 var pl = gbox.getObject("player","player");
			 var yCurr,xCurr,rand;
			 if (pl.x < 6*30){//player hit left edge
				 xMin = (xMin == 0 ? totalCells - 1 : xMin - 1);
				 xMax = (xMax == 0 ? totalCells - 1 : xMax - 1);
				 yCurr = yMin;
				 xCurr = xMin;
				 for(var i=0; i<maze1.map.length; i++){
					for(var j=0; j<shiftAmount;j++){
						if (lightType == 8){
							maingame.addGround((-1)*30,i*30,""+xCurr+":"+yCurr);
						}
						rand = Alea(seed,xCurr,yCurr);
						maze1.map[i].pop();
						maze1.map[i].unshift(arrPieces[rand()*arrPieces.length>>>0]);
						addEntities(rand,-1,i)
						yCurr = (yCurr + 1) % totalCells;
				 	}
				 }
				 xShift = shiftPixels;
				 //shift map x spaces left
			 }else if (pl.x > maze1.w-6*30){//player hit right edge
				 xMin = (xMin + 1) % totalCells;
				 xMax = (xMax + 1) % totalCells;
				 yCurr = yMin;
				 xCurr = xMax;
				 for(var i=0; i<maze1.map.length; i++){
					 for(var j=0; j<shiftAmount;j++){
						if (lightType == 8){
							maingame.addGround((maze1.map[0].length)*30,i*30,""+xCurr+":"+yCurr);
						}
						rand = Alea(seed,xCurr,yCurr);
						 maze1.map[i].shift();
						 maze1.map[i].push(arrPieces[rand()*arrPieces.length>>>0]);
						 addEntities(rand,maze1.map[0].length, i);
						 yCurr = (yCurr + 1) % totalCells;
					 }
				 }
				 xShift = -shiftPixels;
				 //shift map x spaces right
			 }
			 if (pl.y < 5*30){//player hit top edge
				 yMin = (yMin == 0 ? totalCells - 1 : yMin - 1);
				 yMax = (yMax == 0 ? totalCells - 1 : yMax - 1);
				 yCurr = yMin;
				 xCurr = xMin;
				 for(var i = 0; i < shiftAmount; i++){
					 maze1.map.pop();
					 maze1.map.unshift(new Array());
					 for(var j = 0; j<maze1.map[1].length; j++){
						if (lightType == 8){
							maingame.addGround(j*30,(-1)*30,""+xCurr+":"+yCurr);
						}
						rand = Alea(seed,xCurr,yCurr);
						 maze1.map[0][j] = arrPieces[rand()*arrPieces.length>>>0];
						 addEntities(rand,j,-1);
						 xCurr = (xCurr + 1) % totalCells;
					 }
				 }
				 yShift = shiftPixels;
				 //shift map x spaces up
			 } else if (pl.y > maze1.h - 5*30){//player hit bottom edge
				 yMin = (yMin + 1) % totalCells;
				 yMax = (yMax + 1) % totalCells;
				 yCurr = yMax;
				 xCurr = xMin;
				 for(var i = 0; i < shiftAmount; i++){
					 maze1.map.shift();
					 maze1.map.push(new Array());
					 for(var j = 0; j<maze1.map[0].length; j++){
						if (lightType == 8){
							maingame.addGround(j*30,(maze1.map.length)*30,""+xCurr+":"+yCurr);
						}
						rand = Alea(seed,xCurr,yCurr);
						 maze1.map[maze1.map.length-1][j] = arrPieces[rand()*arrPieces.length>>>0];
						 addEntities(rand,j,maze1.map.length);
						 xCurr = (xCurr + 1) % totalCells;
					 }
				 }
				 yShift = -shiftPixels;
				 //shift map x spaces down
			 }
			 if (xShift != 0 || yShift != 0)
			 {
				pl.y += yShift;
				pl.x += xShift;
				 for(var entity in gbox._objects["will"]){
					 shiftEntity(gbox.getObject("will", entity), xShift, yShift);
				 }
				 for(var entity in gbox._objects["bug"]){
					 shiftEntity(gbox.getObject("bug", entity), xShift, yShift);
				 }
				 if(lightType == 8){
				 	for(var entity in gbox._objects["ground"]){
					 	shiftEntity(gbox.getObject("ground", entity), xShift, yShift);
				 	}
				 }
			 }
			//gbox.blitTilemap(gbox.getCanvasContext("mazecanvas"),maze); // Let's paste the maze map in the "maze" object into the just created "mazecanvas". So is now ready to be rendered.
			gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas1"),maze1);
			gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas2"),maze2);
			gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas3"),maze3);
			gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas4"),maze4);
			gbox.blitTilemap(gbox.getCanvasContext("mazeCanvas5"),maze5);
			if (m_bDebug){
				maingame.hud.setValue("xMin","value",leadingZeros(xMin,2));
				maingame.hud.setValue("xMax","value",leadingZeros(xMax,2));
				maingame.hud.setValue("yMin","value",leadingZeros(yMin,2));
				maingame.hud.setValue("yMax","value",leadingZeros(yMax,2));
			}
			 // This method happens every frame of the gameplay. You can keep here game timers or make happen random things, like...
		 //	if (maingame.pillscount==0) // ...check if the maze is clear...
		//		maingame.gotoLevel(maingame.level+1); // ...and warp to the next level, if true.
		  }

		  function leadingZeros(val,totalWidth){
			  var output = ""+val;
			  while(output.length < totalWidth)
				  output = "0"+output;
			  return output;
		  }

		function shiftEntity(obj, xShift, yShift){
			
					 if ((obj.y < yShift && yShift < 0) || 
						 (obj.y > maze1.h - yShift && yShift > 0) ||
						 (obj.x < xShift && xShift < 0) ||
						 (obj.x > maze1.w - xShift && xShift > 0))
						gbox.trashObject(obj);
					 else{
				 		obj.y += yShift;
						obj.x += xShift;
					 }
		}	


		// Last but not least, the intro screen.
		// As you've seen, there are a bunch of method that are called by the "maingame" during the game life. We've used the default behaviour for most of them (the "let's begin" message, the "gameover" screen etc.)
		// but all of them are customizable. In this case, we're going to create a custom intro screen.
		maingame.gameTitleIntroAnimation=function(reset) {
			if (reset) { // "reset" is true before the first frame of the intro screen. We can prepare the intro animation...
				toys.resetToy(this,"rising"); // Like resetting a local toy. Some of the toys are "helpers": they use a local datastore of an object and does stuff, when called. For example: we're reserving a data store called "rising" to the "maingame" object.
			} else { // Then, when is the time to render our animation...
				gbox.blitFade(gbox.getBufferContext(),{alpha:1}); // First clear up the screen...
				toys.logos.linear(this,"rising",{image:"logo",x:gbox.getScreenHW()-gbox.getImage("logo").hwidth,y:20,sx:gbox.getScreenHW()-gbox.getImage("logo").hwidth,sy:gbox.getScreenH(),speed:1,audioreach:"eatghost"}); // Then we're telling to the "linear" toy (which renders something that moves from a point to another and eventually plays an audio on end) to use the "rising" data store, for keeping his values.
			}
		}
	
		// No level intro animation
		maingame.gameIntroAnimation=function() { return true; }


		 // That's all. Please, gamebox... run the game!
		  gbox.go();

	}


