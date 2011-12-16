gbox.onLoad(function(){
	help.akihabaraInit({
		title:"Firefly",
		splash:{footnotes:["Game Design and Art by David Frankel","Programming by Quin Kennedy"], background:"resources/splash.png"}
		});

	gbox.addImage("cels", "resources/cels.png");
	gbox.addImage("scenery", "resources/gfx-village.png");
	gbox.addTiles({id:"boy", image:"cels", tileh:30, tilew:30, tilerow:12, gapx:0, gapy:0});
	gbox.addTiles({id:"firefly", image:"cels", tileh:10, tilew:10, tilerow:1, gapx:109, gapy:163});
	gbox.addTiles({id:"will", image:"cels", tileh:30, tilew:30, tilerow:1, gapx:240, gapy:155});
	gbox.addTiles({id:"bg", image:"scenery", tileh:30, tilew:30, tilerow:10, gapx:0, gapy:0});

	gbox.loadAll(go);
}, false);

function go(){
}
