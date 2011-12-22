var Player = function(){
	return({
				id:"player", // Every object has an ID for being picked up every time (we've used the ID into newLife)
				group:"player", // ... and is put in a group (do you remember the setGroups command?)
				tileset:"player", // Uses this tileset, generated during loading phase...
				killed:false, // and, for now, was not killed.
				scorecombo:1, // We'll keep also the score combo, while eating ghosts. at start is 0. Will increase while we're invincible.
				bugs:0,
				stilltimer:0,
				initialize:function() { // The "initialize" method is called the first frame the object spawns and never more.
					// We will use the topview toys, since player is... well... a top view game.
					toys.topview.initialize(this,{
						haspushing:true,
						shadow:{tileset:"shadows", tile:0},
						frames:{ // These are quite self explanatory
							standup:{ speed:1, frames:[0] },
							standdown:{ speed:1, frames:[3] },
							standleft:{ speed:1, frames:[6] },
							standright:{ speed:1, frames:[6] },
							movingup:{speed:3,frames:[0,1,0,2] },
							movingdown:{speed:3,frames:[3,4,3,5] },
							movingleft:{speed:3,frames:[6,7] },
							movingright:{speed:3,frames:[6,7] },
							pushingup:{speed:6,frames:[0,1,0,2] },
							pushingdown:{speed:6,frames:[3,4,3,5] },
							pushingleft:{speed:6,frames:[6,7] },
							pushingright:{speed:6,frames:[6,7] }
						}
						// What? Starting "x" and "y" are not here. That's because, when the first level starts, the "newLife" calls "spawn" over the player, setting the position.
					});
				},
				gotBug:function(){
					this.bugs++;
				},
attack:function() {
		gbox.hitAudio("swing");

		this.stilltimer=10; // Stay still for a while
		this.frame=(this.facing==toys.FACE_UP?9:(this.facing==toys.FACE_DOWN?10:11));

		 // net
				toys.topview.fireBullet("playerbullets",null,{
					fullhit:true,
					collidegroup:"bug",
					undestructable:true, // Custom attribute. Is not destroyed by the hitted object.
					power:1, // Custom attribute. Is the damage value of this weapon.
					from:this,
					sidex:this.facing,
					sidey:this.facing,
					tileset:((this.facing==toys.FACE_LEFT)||(this.facing==toys.FACE_RIGHT)?"lefthit":"uphit"),
					frames:{speed:1,frames:[0,1,2,3]},
					duration:4,
					acc:5,
					fliph:(this.facing==toys.FACE_RIGHT),
					flipv:(this.facing==toys.FACE_DOWN),
					angle:toys.FACES_ANGLE[this.facing]
				});
	},

				first:function() { // Usually everyting involving interacton is into the "first" method.
					if (this.stilltimer) this.stilltimer--;

					this.counter=(this.counter+1)%60; // This line must be used in every object that uses animation. Is needed for getting the right frame (the "frames" block few lines up)

					if (!this.killed&&!maingame.gameIsHold()) { // If player is still alive and the game is not "hold" (level changing fadein/fadeouts etc.) and the "bullet timer" is not stopping the game.

						// First of all, let's move.
						toys.topview.controlKeys(this,(this.stilltimer ? {} : {left:"left",right:"right",up:"up",down:"down"})); // Set player's horizontal and vertical speed.
						toys.topview.handleAccellerations(this);
						toys.topview.applyForces(this); // Moves player
						// Note that our player will keep going since we're not changing the speed given by controlKeys and applied by applyForces (i.e. toys.handleAccellerations)
						toys.topview.tileCollision(this,maze,"map",null); // check tile collisions.
																								  // tolerance indicates how "rounded" the corners are (for turning precision - in player have to be precise but not too much, for anticipated turnings)
																								  // Approximation is the distance in pixel of each check. Lower approximation is better but is slower. Usually using the lower between the tile size and the sprite height is enough.

						if (!this.stilltimer){
							toys.topview.setFrame(this); // setFrame sets the right frame checking the facing and the defined animations in "initialize"
							if(gbox.keyIsHit("a")){
								this.attack();
							}
						}
					}
				},

				// The blit phase is the very last method called every frame. It should only draw the object on the bufferContext (i.e. the screen)
				blit:function() {
					if (!this.killed) // If the player is alive, then draw it on the screen. Is a nice trick, since is not needed to destroy/recreate the player every life.
						gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,fliph:this.fliph,flipv:this.flipv,camera:this.camera,alpha:1});
						// That means: draw, from my tileset, a frame in position dx,dy flipping the sprite horizontally and/or vertcally, using the camera coords and with full opacity
						// All the arguments are taken from this: the "toys" values everything for doing something coherent from the genre of game you're using.
						// So, our "player" flips, moves and does animation automatically. Really nerds can code something more complex, skipping or integrating the
						// "toys" methods.
				},

				// And now, a custom method. This one will kill the player and will be called by ghosts, when colliding with player.
				kill:function() {
					if (!this.killed) { // If we're alive...
						this.killed=true; // First of all, player is killed. As you've seen, that makes player invisible and on hold.
						gbox.hitAudio("die"); // Play the die sound
						maingame.hud.addValue("lives","value",-1); // Then decrease the lives count.
						maingame.playerDied({wait:50}); // Telling the main game cycle that the player died. The arguments sets a short delay after the last fadeout, for making visible the dead animation
						toys.generate.sparks.simple(this,"sparks",null,{tileset:this.tileset,frames:{speed:4,frames:[6,5,7,8,9,9,9,9]}});
						// And here comes a common trick: the player is still where was killed and a "spark" (i.e. unuseful animation) starts in the same place.
						// This method allows many nice tricks, since avoid destruction/recreation of the player object, allow a respawn the player in the place it was killed very easily (switching
						// the killed attribute. The "spark.simple" method spawns a spark in the same position of the object in the first argument.
					}
				}

			  });}

