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
		 //	if (maingame.pillscount==0) // ...check if the maze is clear...
		//		maingame.gotoLevel(maingame.level+1); // ...and warp to the next level, if true.
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


