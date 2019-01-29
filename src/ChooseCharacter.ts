class ChooseCharacter extends Phaser.Scene {

    constructor() {
        super({ key: 'ChooseCharacter', active:false });
    }

    preload(){
        this.load.image("Space", "assets/space3.png");
    }

    create() {
        this.add.image(0,0,"Space");
    }

}