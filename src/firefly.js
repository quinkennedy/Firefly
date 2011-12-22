// ---
// Copyright (c) 2010 Francesco Cottone, http://www.kesiev.com/
// ---

	// Hello! If you're thinking that the "Capman" demo was the easier... you're wrong ;) Well... at least is the most documented. So, let's travel between
	// the "player"'s code. I'll be quite informal... forgive me!
	// Ow! First of all, play player a bit, paying attention on what happens on the screen: how ghosts moves, how player is controlled etc. Done? Ok. Let's go.

		  // These objects will be reachable everywhere. Usually are the levels, the dialogues and the maingame object.
		  var maingame; // The magic object that handles the full play cycle
		  var maze; // The maze array, with pills and walls


		// First of all, let's load all the needed resources. Is done on the "onLoad" event of the window.
		gbox.onLoad(function () {
			
			help.akihabaraInit({ // Akihabara is initialized with title and all the default settings.
				title:"Firefly", // ... Just changing the game title...
				splash:{footnotes:["Art Director: David Frankel, Programming: Quin Kennedy", "etc: David Frankel & Quin Kennedy","Contact us: quinkennedy@gmail.com"], 
				background:"resources/splash.png",
				minimalTime:0}//custom splash screen
			});

			gbox.addBundle({file:"resources/bundle.js"});//load resources, if you do it this way, then the splash screen shows while loading other resources

			gbox.loadAll(go); // When everything is ready, the "loadAll" downloads all the needed resources and runs the "go" function when it's done loading.

		}, false);

		  function go() {

		  	// The very first thing to do is to set which groups will be involved in the game. Groups can be used for grouped collision detection and for rendering order
		 	gbox.setGroups(["background","player","bug","will","playerbullets","gamecycle"]); // Usually the background is the last thing rendered. The last thing is "gamecycle", that means games messages, like "gameover", menus etc.
		 	gbox.setAudioChannels({bgmusic:{volume:0.8},sfx:{volume:1.0}}); // If we're going to add audio to our game, we have to create virtual channels. Channels acts like groups but for audio: audio on the same channels can be stopped together and shares the same highest volume.


		 	maingame=gamecycle.createMaingame("gamecycle","gamecycle"); // We create a new maingame into the "gamecycle" group. Will be called "gamecycle". From now, we've to "override" some of the maingame default actions.


		   // This method is called every new level. That is called also for the first level, so...
		  maingame.changeLevel=function(level) {
		  		// The first time the "changeLevel" is called, level is NULL. Our first stage is "1", so...
		  		if (level==null) level=1;
		  		// We need to store this number somewhere, since is needed to define which is the next level.
		  		maingame.level=level; // "maingame" is handy enough to store some game data.
		  		//maingame.hud.setValue("stage","value","STAGE "+level); // Put on the screen the stage name (I'll explain what the "hud" is in the "initializeGame" function)


				// Let's prepare the maze map now. Every stage is the same level but you can generate a new level each "changeLevel" call, using the "level" argument value.
				// This is just an array with the tile id or NULL for an empty transparent space.
				maze=help.finalizeTilemap({ // finalizeTilemap does some magic to the maze object: calculate real width/height of the map in pixels and values the "h" and "w" property.
					tileset:"tiles", // This is the tileset used for rendering the map.
					map:help.asciiArtToMap([ // Hey, wait! This is an ascii art of the map? Yes! "asciiArtToMap" convers an array of string in an array of arrays, using...
				"..0mm.....",
				"....m..m..",
				".......mm.",
				"......mm..",
				"..........",
				"..m...m...",
				"....m0....",
				"0..mm....m",
				"mm.......m",
				"mmm....m.0"
				],[[0,"."],[10,"0"],[11,"m"]]), // ...this array as palette. Don't you think that a map like this is quite easy to edit and read with your on-the-go text editor?
					tileIsSolid:function(obj,t){ // This function have to return true if the object "obj" is checking if the tile "t" is a wall, so...
							return (t!==0);
					}

				 });
				gbox.createCanvas("mazecanvas",{w:maze.w,h:maze.h}); // Since finalizeMap have calculated the real height and width, we can create a canvas that fits perfectly our maze... Let's call it "mazecanvas".
				gbox.blitTilemap(gbox.getCanvasContext("mazecanvas"),maze); // Let's paste the maze map in the "maze" object into the just created "mazecanvas". So is now ready to be rendered.

				// Then, we need to count the number of pills to eat... quite crucial, to define when the maze was cleared. Since we're lazy, we're going to cycle the map and increase a counter instead of counting them by hand.
				this.pillscount=1; // Yes. We're creating a custom counter into the "maingame" object. You can call this dirty. I call this flexibility. And relax :)


				this.newLife(); // We will call the local "newLife" method, since this came displaces enemies and player every new level. Do you remember this in player? ;)
		  }

		  // This event is triggered every time the player "reborn". As you've seen, is manually called in the last line of "changelevel"
		  maingame.newLife=function(up) {
		  	// Let's clean up the level from the ghosts, sparks (visual effects like explosions - in player are sparks the earned points messages) and left bonuses, if any.
		  	gbox.trashGroup("bug");
		  	gbox.trashGroup("will");
		  	gbox.purgeGarbage(); // the gbox module have a garbage collector that runs sometime. Let's call this manually, for optimization (and better reinitialization)
			toys.topview.spawn(gbox.getObject("player","player"),{x:maze.hw,y:maze.hh,accx:0,accy:0,xpushing:false,ypushing:false}); // Our "player" object into the "player" group spawns in the middle of the maze every time it spawns.
			maingame.addBug(10, 10, 0);
			maingame.addBug(20, 20, 1);
			maingame.addBug(40,40,2);
			//maingame.addGhost({id:1,x:maze.hw-12,y:maze.hh-20}); // Ghost are added here
			//maingame.addGhost({id:2,x:maze.hw-24,y:maze.hh-17});
			//maingame.addGhost({id:3,x:maze.hw+4,y:maze.hh-20});
			//maingame.addGhost({id:4,x:maze.hw+14,y:maze.hh-17});
			gbox.playAudio("background"); // Start playing the ingame music. Notes that the "maingame" object will fade in/out and stop the "bgmusic" channel when the screen will fade automatically. We just need to play the music when the screen is fading to fade the music too!
		  }


		// This method is called before starting the game, after the startup menu. Everything vital is done here, once per play.
		maingame.initializeGame=function() {

			// Maingame gives an "hud" object that is rendered over everything. Really useful for indicators, like score, lives etc. The first thing we do is to populate this object.
			//maingame.hud.setWidget("label",{widget:"label",font:"small",value:"1UP",dx:240,dy:10,clear:true}); // This is a classic "1UP" static label. Unuseful but really retro!
			//maingame.hud.setWidget("score",{widget:"label",font:"small",value:0,dx:240,dy:25,clear:true}); // A score counter. This not only is a displayed value but will really keep the player's score.
			//maingame.hud.setWidget("label",{widget:"label",font:"small",value:"HI",dx:240,dy:40,clear:true}); // The "HI" label. Becouse "HI" is more retro.
			//maingame.hud.setWidget("hiscore",{widget:"label",font:"small",value:0,dx:240,dy:55,clear:true}); // The hiscore counter. This one will be just used for displaying.

			//maingame.hud.setWidget("lives",{widget:"symbols",minvalue:0,value:3-maingame.difficulty,maxshown:3,tileset:"player",tiles:[5],dx:240,dy:70,gapx:16,gapy:0}); // The classic life indicator, with repated player symbols. Note the "difficulty usage" ;)
			maingame.hud.setWidget("stage",{widget:"label",font:"small",value:"",dx:0,dw:gbox.getScreenW()-5,dy:gbox.getScreenH()-13,halign:gbox.ALIGN_RIGHT,clear:true}); // The label with the stage name (low creativity: STAGE 1, STAGE 2 etc). Is empty for now, will be filled when a new level starts.

			//maingame.hud.setValue("hiscore","value",gbox.dataLoad("player-hiscore")); // setValue is used to set parametes on hud. So, well, we're setting the "hiscore value" to the loaded data "player-hiscore" that contains the latest hiscore.

			// An object will draw the maze on the screen
			 gbox.addObject({
				id:"bg", // This is the object ID
				group:"background", // Is in the "backround" group, that is the lower group in the "setGroups" list. Will be drawn for first.
				//initialize:function() { // This action is executed the first time the object is called, so...
					//gbox.setCameraY(0,{w:maze.w,h:maze.h}); // We place the camera a bit down, since the full maze doesn't fit the screen.
				//},
				blit:function() { // Then, the most important action: the "blit", where object are drawn on the screen.
					gbox.centerCamera(gbox.getObject("player","player"),{w:maze.w,h:maze.h});
					gbox.blitFade(gbox.getBufferContext(),{alpha:1}); // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
					gbox.blit(gbox.getBufferContext(),gbox.getCanvas("mazecanvas"),{dx:0,dy:0,dw:gbox.getCanvas("mazecanvas").width,dh:gbox.getCanvas("mazecanvas").height,sourcecamera:true}); // Simply draw the maze on the screen.
				}
			  });


			// Now, let's add our player. The player is usually added once per match and "moved" in the map on level changes (as you've seen into the newLife method)
			gbox.addObject(new Player());

	 	 }

		maingame.addBug = function(x, y, index){
			var bug = gbox.addObject(new Bug(x, y, index));
			return bug;
		}

	 	 // Now is the time to explain how to create a generator. Is nothing but a new method of maingame that generate an object at given position.
	 	 maingame.addGhost=function(data) { // Let's start with something that spawn a ghost. Objects as arguments are not only flexible, but you can give a name to the parameters or skipping them when calling.
	 	 	// Ghosts are objects too, like player.
			gbox.addObject({
				ghostid:data.id, // We will give a number to each ghost, since their behaviour is quite similiar, with some exception I'll explain. Let's store this id here.
				id:"ghost"+data.id, // The object name is derived from the passed ID. So, addGhost({id:1}); will generate a "ghost1" object.
				group:"ghosts", // Ghosts are all on their group
				tileset:"ghost"+data.id, // A nice trick, isn't it? Ghost ID 1 will pick the "ghost1" tileset, that means a red ghost, ID 2 gets the light blue one and so on.
				status:"inhouse", // We will use a "status" property to check what the ghost is doing: if is in his house, waiting for going up, if is chasing player or if is escaping. At the begining it is in his house...
				time:75, // ...and will stay there for 75 frames.

				initialize:function() { // From now, go back to the player object for what I'm not commenting. You're getting better, so let's make the things harder :)
					toys.topview.initialize(this,{
						colh:gbox.getTiles(this.tileset).tileh, // That is like player...
						colw:gbox.getTiles(this.tileset).tilew,
						staticspeed:2,
						nodiagonals:true,
						noreset:true,
						frames:{
							still:{ speed:2, frames:[0] },
							hit:{speed:1,frames:[0,1,0,1]},
							standup:{ speed:1, frames:[0] },
							standdown:{ speed:1, frames:[1] },
							standleft:{ speed:1, frames:[2] },
							standright:{ speed:1, frames:[2] },
							movingup:{speed:1,frames:[0] },
							movingdown:{speed:1,frames:[1] },
							movingleft:{speed:1,frames:[2] },
							movingright:{speed:1,frames:[2] }
						},
						x:data.x, // This time, we will place ghosts on creation. We will destroy and recreate the ghosts every time, since the status of enemies, bullets and foes rarely needs to be kept.
						y:data.y
					});
				},

				first:function() {
					this.counter=(this.counter+1)%10; // Our animation handler...

					var olddata=help.createModel(this,["x","y","accx","accy","facing"]); // Just like player, we will use this to cancel a movement, if hits the wall.
					if (!maingame.gameIsHold()) { // The killed condition is no longer here, since the ghosts never die :(

						switch (this.status) { // player does the same thing during the game but ghosts, instead, are busy in many activities, like...

							case "inhouse": { // ...bouncing up and down in their house.
								// Now we're going into the interesting part: things that moves by itself. Every genre of game has their ways: shoot'em up uses usually scripted or procedural movement, platform games can
								// have very complex scripts... For player, we're going to use the "virtual stick" way: ghosts moves exactly like player but moved by a "virtual joystick" that we're going to move for him.
								// Let's see how. There are several advantages on using virtual sticks, for example, we're using all the toys for deciding direction, movement and collisions.
								if (this.facing == toys.FACE_UP) // If the ghost is facing up...
									toys.topview.controlKeys(this,{pressup:1}); // ...we simulate to press up on his virtual joystick...
								else
									toys.topview.controlKeys(this,{pressdown:1}); // ...else we're pressing down.
								toys.topview.applyForces(this); // Let's move the ghost...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								if (this.touchedup||this.toucheddown) // If the ghost touched the border of the house...
									this.facing=(this.facing==toys.FACE_UP?toys.FACE_DOWN:toys.FACE_UP); // Invert their direction. The next cycle, the ghost will move in the opposite direction.

								if (this.time==0) // If is time to go out from the house
									this.status="goout"; // Let's change the status
								else
									this.time--; // else keep counting the frames.

								break; // That's all. Our ghost is moving up and down.
							}

							case "goout": { // So we're leaving the house.
								if (this.x<maze.hw-this.hw) { // If we're on the left side of the maze (note: finalizeTilemap have valued also half width and height of the map)
									toys.topview.setStaticSpeed(this,1); // Slowly... (notes: we're using "setStaticSpeed" when creating classic maze games, when pixel-precision with the playfield is needed, like player or bomberman games)
									toys.topview.controlKeys(this,{pressright:1}); //  Let's move to the right
								} else if (this.x>maze.hw-this.hw) { // If we're on the right side...
									toys.topview.setStaticSpeed(this,1); // Slowly...
									toys.topview.controlKeys(this,{pressleft:1}); //  Let's move to the left
								} else { // And, if we're on the center
									toys.topview.setStaticSpeed(this,2) // Faster!
									toys.topview.controlKeys(this,{pressup:1}); //  Let's move up, out from the house
								}
								toys.topview.applyForces(this); // Let's move the ghost...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								if (this.touchedup) // If the ghost touches a border up...
									this.status="chase"; // We're out from the labirynth. Is the time to kick the player a$$!
								break; // That is enough.
							}

							case "chase": { // We're ghosts. And angry. Let's go after player!
								toys.topview.setStaticSpeed(this,2) // Setting the moving speed.
								// I've read somewhere that ghosts have different "aggressivity". We're going to simulate this this way: we're creating two different behaviours. The first one moves the ghost
								// toward player's position. The second one is completely random. How to decide how much "aggressive" the ghost is?
								var aggressivity=this.ghostid; // First of all, let's calculate the aggressivity. Lower values means more aggressivity, so ghost 1 is more aggressive than ghost 4.
								aggressivity-=maingame.level-1; // The, we're going to increase the aggressivity each level. so ghost 4 is aggressive 4 in level 1, aggressive 3 in level 2, aggressive 2 in level 3 and so on.
								if (aggressivity<0) aggressivity=0; // If we're going mad (aggressivity<0) let's keep the calm: lower aggressivity threshold is 0.
								if (help.random(0,aggressivity)==0) { // ...now ghosts with lower aggressivity have more possibilites to move toward player. Higher aggressivity means more probabilities to get a random direction.
									// This is the "chasing" method. Is quite simple.
									var player=gbox.getObject("player","player"); //  First of all, let's check where is player.
									if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) { // Ghosts can't go in their opposite direction, so if we're moving horizontally, the next move is vertical and vice versa.
										if (player.x>this.x) // is on my right?
											toys.topview.controlKeys(this,{pressright:1}); //  Let's move right.
										else if (player.x<this.x) // on my left?
											toys.topview.controlKeys(this,{pressleft:1}); //  Let's move left.
									} else {
										if (player.y>this.y) // is under me?
											toys.topview.controlKeys(this,{pressdown:1}); //  Let's move down.
										else if (player.y<this.y) // is over me?
											toys.topview.controlKeys(this,{pressup:1}); //  Let's move up.
									}
								} else { // If we're moving randomly...
									if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) // The same condition of moving...
										if (help.random(0,2)==0) toys.topview.controlKeys(this,{pressleft:1}); else toys.topview.controlKeys(this,{pressright:1}); // But direction is random, this time.
									else
										if (help.random(0,2)==0) toys.topview.controlKeys(this,{pressup:1}); else toys.topview.controlKeys(this,{pressdown:1});
								}
								toys.topview.applyForces(this); // Then we're moving to that direction...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								break;
							}

							case "eaten": { // We were eaten by player. We need to go back to the ghost's house door, that is near the center of the maze.
								toys.topview.setStaticSpeed(this,4); // We're in a hurry now!
								if ((this.x==maze.hw-this.hw)&&(this.y==maze.hh-38)) // If we've reached the door
									this.status="goin"; // ... and let's enter the door
								else {
									if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) { // The code is the same of the chase version, but we're going toward the center
										if (maze.hw-this.hw>this.x) toys.topview.controlKeys(this,{pressright:1});
										else if (maze.hw-this.hw<this.x)  toys.topview.controlKeys(this,{pressleft:1});
									} else {
										if (maze.hh-38>this.y) toys.topview.controlKeys(this,{pressdown:1});
										else if (maze.hh-38<this.y) toys.topview.controlKeys(this,{pressup:1});
									}
								}
								toys.topview.applyForces(this); // Then we're moving to that direction...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								break;
							}

							case "goin": { // Now we're going back at home. Just moving down slowly...
								toys.topview.setStaticSpeed(this,1) // Slowly...
								toys.topview.controlKeys(this,{pressdown:1}); // Moving down...
								toys.topview.applyForces(this); // Let's move...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								if (this.toucheddown) { // If we've touched the house floor...
									this.tileset=this.id; // change wear...
									toys.topview.setStaticSpeed(this,2) // Faster...
									this.time=75; // We stay here for a while...
									this.status="inhouse"; // ...and remember that after the "inhouse", the cycle starts over again: "goout" and "chase"!
								}
								break;
							}

							case "escape":{ // If we're escaping from player, the logic is the reverse of chase, so...
								toys.topview.setStaticSpeed(this,1) // Slowly
								var player=gbox.getObject("player","player"); //  Where is player?
								if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) {
									if (player.x>this.x) // is on my right?
										toys.topview.controlKeys(this,{pressleft:1}); //  Let's move left|
									else if (player.x<this.x) // on my left?
										toys.topview.controlKeys(this,{pressright:1}); //  Let's move right!
								} else {
									if (player.y>this.y) // is under me?
										toys.topview.controlKeys(this,{pressup:1}); //  Let's move up!.
									else if (player.y<this.y) // is over me?
										toys.topview.controlKeys(this,{pressdown:1}); //  Let's move down!
								}
								toys.topview.applyForces(this); // Then we're moving to that direction...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check if is colliding with a wall.
								this.time--; // Decrease the timer. This time means for how much time the ghost is vulnerable.
								if (this.time>0) { // if we can be eaten...
									// Now we're setting the tileset. Switching tilesets with the same number of frames allow to change dynamically how the character looks. This is a sample:
									if (this.time>50) // If there is a lot of time left to be eaten...
										this.tileset="ghostscared"; // let's pick the "scared" tileset (that one with blue color and wavy mouth)
									else // ...else, if time is running out...
										if (Math.floor(this.time/4)%2==0) // This is a little trick for make a think blinking using only a counter. The "/2" slow down the blink time and the "%2" gives an "on/off" output. So...
											this.tileset="ghostscared"; // sometime picks the scared tileset...
										else
											this.tileset=this.id; // ...and sometime picks the original tileset.
								} else {
									this.tileset=this.id; // set the original tileset...
									this.status="chase"; // and go back for chasing!
								}


								break;
							}
						}

						// Not scripted movements can end on "still" condition (for example, we're trying to move toward a wall)
						// So, since ghosts never stop moving, we're going to make sure that a direction is taken, if the last movement touched a wall.
						if ((this.status=="chase")||(this.status=="eaten")||(this.status=="escape")) {

							if (this.touchedup||this.toucheddown||this.touchedleft||this.touchedright) { // If hitting a wall
								help.copyModel(this,olddata); // we're reversing to the old movement...
								toys.topview.controlKeys(this,{pressup:(this.facing==toys.FACE_UP),pressdown:(this.facing==toys.FACE_DOWN),pressleft:(this.facing==toys.FACE_LEFT),pressright:(this.facing==toys.FACE_RIGHT)}); // Push toward the old direction.
								toys.topview.applyForces(this); // redo the moving...
								toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check collision.
								if (this.touchedup||this.toucheddown||this.touchedleft||this.touchedright) { //Uh-oh. If colliding here too, our ghost is really stuck.
									for (var i=0;i<4;i++) // So we're trying to move in any of the four direction.
										if (i!=((olddata.facing+2)%4)) { // Do you remember? Ghosts cannot go back, so we're skipping the opposite direction. The trick: opposite direction is current direction +2. Have a look to the toys constants.
											help.copyModel(this,olddata); // First, go back on the starting point...
											toys.topview.controlKeys(this,{pressup:(i==toys.FACE_UP),pressdown:(i==toys.FACE_DOWN),pressleft:(i==toys.FACE_LEFT),pressright:(i==toys.FACE_RIGHT)}); // Push one of the direction
											toys.topview.applyForces(this); // redo the moving...
											toys.topview.tileCollision(this,maze,"map",null,{tolerance:0,approximation:1}); // ...and check collision again.
											if (!(this.touchedup||this.toucheddown||this.touchedleft||this.touchedright)) break; //  If we've not touched anything, we're no longer stuck!
											// Else, we'll try the other direction
										}
									// If we're here, a valid direction was taken. YAY!
								}
							}

						}

						toys.topview.setFrame(this); // Every remember to call this at least once :)

						// The side warp is valid for ghosts too! :)
						if ((this.x<0)&&(this.facing==toys.FACE_LEFT))  this.x=maze.w-this.w;
						else if ((this.x>(maze.w-this.w))&&(this.facing==toys.FACE_RIGHT)) this.x=0;

						// Then... let's bug player a bit
						var player=gbox.getObject("player","player"); // As usual, first we pick our player object...
						if (gbox.collides(this,player,2)) { // If we're colliding with player, with a tolerance of 2 pixels...
							if (this.status=="chase") { // and we're hunting him...
								player.kill(); // ...kill player. "kill" is the custom method we've created into the player object.
							} else if (this.status=="escape") { // else, if we were escaping from player (uh oh...)
								gbox.hitAudio("eatghost"); // Play the ghost-eaten sound.
								toys.generate.sparks.popupText(player,"sparks",null,{font:"small",jump:5,text:player.scorecombo+"x100",keep:20}); // Text sparks are useful to "replace" sound effects, give quick hints o make a game really rad! ;)
								maingame.hud.addValue("score","value",player.scorecombo*100); // Gives to the player 100*combo points...
								player.scorecombo++; // Increase the combo counter...
								this.tileset="ghosteaten"; // change wear...
								this.status="eaten"; // ...and let's go back to the house...
							}
						}

					}
				},

				makeeatable:function() { // If called, the ghost became eatable by player. Is called by player when a powerpill is eaten
					if (this.status=="chase") { // If was chasing player...
						this.status="escape"; // Time to escape!
						this.time=150; // For a while :)
					}
				},

				blit:function() { // In the blit phase, we're going to render the ghost on the screen, just like player.
					gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,fliph:this.fliph,flipv:this.flipv,camera:this.camera,alpha:1});
				}

			  });


	 	 }

	 	 // Some final touch to the maingame object...
		  maingame.gameIsOver=function() { // This method is called by maingame itself to check if the game is over or not. So...
		  	var isGameover=maingame.hud.getValue("lives","value")==0; // the game is REALLY over when lives counter reaches the zero.
		  	if (isGameover) // Just in time, we can do something useful, since we're here. Like... checking if we have a new *CAPMAN CHAMPION*...
		  		if (maingame.hud.getNumberValue("score","value")>maingame.hud.getNumberValue("hiscore","value")) // If the player's score is higher the shown hiscore...
		  			gbox.dataSave("player-hiscore",maingame.hud.getNumberValue("score","value")); // ... save the player's score as new hiscore. The next time we play "player", the new hiscore to beat will be this one.
		  	return isGameover; // Finally, returning if the game is ended or not.
		  }
		  // You can do this hiscore business in the ending animation, but for a tutorial, the "gameIsOver" is good enough. Is also unfair that there isn't an hiscore for each difficulty level. The world is bad... luckly you can this sources whenever you want, as exercise.

		 // And now let's do something not related with ghosts, players, pills and mazes. Usually random things and hidden countings happens during the gameplay, so...
		 maingame.gameEvents=function() { // This method happens every frame of the gameplay. You can keep here game timers or make happen random things, like...
		 	if (maingame.pillscount==0) // ...check if the maze is clear...
				maingame.gotoLevel(maingame.level+1); // ...and warp to the next level, if true.
		  }

		 // Another generator, but this one is simplier: this spawns a bonus in the middle of the maze.
	 	 maingame.addBonus=function(data) { // Let's start with something that spawn a ghost. Objects as arguments are not only flexible, but you can give a name to the parameters or skipping them when calling.
	 	 	// All the bonuses have the same code, with a "bonusid" variable that changes its look and score. Notice that the bonus object don't use any toys, except for spawning sparks.
	 	 	// This is an example of an object implemented using nothing but the gbox object for his life cycle.
			gbox.addObject({
				id:null, // Bouns doesn't need to be referred, so we can give to him a "null" id. A random ID is given when created
				group:"bonus", // Bonuses are in their group...
				tileset:"bonus", // Using their tilesets...
				time:250, // ...and remains on the screen for a little while.
				bonusid:data.bonusid, // We're keeping here which type of bonus we are.
				frame:(data.bonusid>7?7:data.bonusid), // The bonus type. The first 8 are different. Then the last one is repeated, but with growing score.
				x:maze.hw-6,y:maze.hh+54,
				first:function() {
					// Bonuses are quite simple...
					var player=gbox.getObject("player","player"); // ... checking where player is.
					if (gbox.collides(this,player)) { // If is colliding with the bonus...
						gbox.hitAudio("bonus"); // Play the bonus sound...
						var bonusscore=((this.bonusid+1)*100); // Calculate the bonus multiplier...
						maingame.hud.addValue("score","value",bonusscore); // Gives to the player the related bonus...
						maingame.hud.pushValue("bonus","value",this.frame); // Add the bonus image to the bonus queue (the pile on the bottom of the screen)
						toys.generate.sparks.popupText(this,"sparks",null,{font:"small",jump:5,text:bonusscore,keep:20}); // Our nice "text spark" with the earned score...
						gbox.trashObject(this); // ...and self-destroy.
					} else if (this.time==0) // If the time is up...
						gbox.trashObject(this); // ...too late, player. Self-destroy without giving points
					else this.time--; // else, countdown.
				},

				blit:function() {
					gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,fliph:this.fliph,flipv:this.flipv,camera:this.camera,alpha:1});
				}

			 });

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
		};


		 // That's all. Please, gamebox... run the game!
		  gbox.go();

	}


