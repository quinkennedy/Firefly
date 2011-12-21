{
//	addImage:[["cels", "resources/cels.png"],
//		["scenery", "resources/gfx-village.png"]],
//	addAudio:[["bgm", "resources/audio/264255_sourcreeeem.mp3",{channel:"bgmusic", loop:"true"}]],
//	addTiles:[{id:"boy", image:"cels", tileh:30, tilew:30, tilerow:12, gapx:0, gapy:0},
//		{id:"firefly", image:"cels", tileh:10, tilew:10, tilerow:1, gapx:109, gapy:163},
//		{id:"will", image:"cels", tileh:30, tilew:30, tilerow:1, gapx:240, gapy:155},
//		{id:"bg", image:"scenery", tileh:30, tilew:30, tilerow:10, gapx:0, gapy:0}]

	addImage:[["logo","resources/logo.png"], // Images are loaded setting an alias and a file name. Can be full images, like the logo (load this ASAP, so will be shown during the loading screen)
		["sprites","resources/cels.png"],
		["font","resources/font.png"],
		["tiles","resources/gfx-village.png"]], // ...or font set.

	addFont:[{id:"small",image:"font",firstletter:" ",tileh:8,tilew:8,tilerow:255,gapx:0,gapy:0}], // Font are mapped over an image, setting the first letter, the letter size, the length of all rows of letters and a horizontal/vertical gap.
			// Sometime you can find pixel fonts with multiple colors, one per row/block. You can map multiple fonts on the same image, so create many fonts, one for each color.

	addTiles:[
		{id:"player",image:"sprites",tileh:30,tilew:30,tilerow:12,gapx:0,gapy:0},
		{id:"bug", image:"sprites", tileh:10, tilew:10, tilerow:1, gapx:109, gapy:163},
		{id:"will", image:"sprites", tileh:30,tilew:30,tilerow:1, gapx:120, gapy:155},

		{id:"lefthit",image:"sprites",tileh:40,tilew:20,tilerow:4,gapx:0,gapy:30},
		{id:"uphit",image:"sprites",tileh:20,tilew:40,tilerow:4,gapx:0,gapy:70},
		{id:"foe1",image:"sprites",tileh:30,tilew:30,tilerow:12,gapx:0,gapy:90},
		{id:"shadows",image:"sprites",tileh:15,tilew:30,tilerow:12,gapx:0,gapy:120},
		{id:"bonus",image:"sprites",tileh:20,tilew:20,tilerow:12,gapx:0,gapy:135},
		{id:"hud",image:"sprites",tileh:20,tilew:20,tilerow:9,gapx:240,gapy:135},

		{id:"flame-white",image:"sprites",tileh:30,tilew:30,tilerow:4,gapx:0,gapy:155},
		{id:"flame-blue",image:"sprites",tileh:30,tilew:30,tilerow:4,gapx:120,gapy:155},
		{id:"flame-red",image:"sprites",tileh:30,tilew:30,tilerow:4,gapx:240,gapy:155},

		{id:"bullet-black",image:"sprites",tileh:15,tilew:15,tilerow:1,gapx:0,gapy:185},

		{id:"door",image:"sprites",tileh:90,tilew:60,tilerow:1,gapx:0,gapy:200},
		{id:"doorv",image:"sprites",tileh:90,tilew:30,tilerow:1,gapx:60,gapy:200},

		{id:"chest",image:"sprites",tileh:30,tilew:30,tilerow:1,gapx:0,gapy:290},

		{id:"leftarrow",image:"sprites",tileh:12,tilew:30,tilerow:2,gapx:0,gapy:320},
		{id:"uparrow",image:"sprites",tileh:30,tilew:12,tilerow:2,gapx:0,gapy:332},

		{id:"items",image:"sprites",tileh:20,tilew:20,tilerow:2,gapx:0,gapy:362},
		{id:"npc",image:"sprites",tileh:30,tilew:30,tilerow:10,gapx:0,gapy:382},

		{id:"house",image:"sprites",tileh:90,tilew:90,tilerow:1,gapx:0,gapy:412},
		{id:"tiles",image:"tiles",tileh:30,tilew:30,tilerow:10,gapx:0,gapy:0}	
	], // The tilesets are taken from the sprite sheet too.

			// Now let's load some audio samples...
	addAudio:[
		["default-menu-option",["resources/audio/select.mp3","resources/audio/select.ogg"],{channel:"sfx"}], // These are default sounds: are played maingame object during menus.
		["default-menu-confirm",["resources/audio/start.mp3","resources/audio/start.ogg"],{channel:"sfx"}],
		["background", ["resources/audio/264255_sourcreeeem.mp3"],{channel:"bgmusic", loop:true}]
			] // This one is the ingame music. We're putting this into the "bgmusic" channel and will be looped: once ended will start over. Note that creating audio into the bgmusic channel makes them "lighter" for the browser, since is ready to be played only one at time.

	
}
