import { DialogBox, Anchor, DialogOptions, Orientation, ButtonOptions } from "./DialogBox";
import { DialogObj, ChoiceObj, DialogTreeObj } from "./DialogTree";
import { Config } from "../Config";
import { KineticScroll, KineticScrollSettings } from "./KineticScroll";

export class DialogPhone extends Phaser.GameObjects.GameObject {

	private Env					: Phaser.Scene;
	private Animate				: boolean;
	private MessageOptions		: DialogOptions;
	private AnswerOptions		: DialogOptions;
	private InputFieldOptions	: DialogOptions;
	private ButtonOptions		: ButtonOptions;

	private Dialogs				: DialogObj;
	private Choices				: ChoiceObj;
	private Messages			: Array<DialogBox>;
	private InputField			: DialogBox;
	private InputCamera			: Phaser.Cameras.Scene2D.Camera;
	private ChoiceIndex			: string;
	private DestroyBoxDelayed	: boolean;

	private KineticScroll		: KineticScroll;
	private Scrolling			: boolean;


	constructor(env: Phaser.Scene, content: DialogTreeObj, animate: boolean,
			messageOptions: DialogOptions,
			answerOptions: DialogOptions,
			inputFieldOptions: DialogOptions,
			buttonOptions) {
		super(env, 'DialogPhone');
		this.Env = env;
		this.Animate = animate;
		this.MessageOptions = messageOptions;
		this.AnswerOptions = answerOptions;
		this.InputFieldOptions = inputFieldOptions;
		this.Dialogs = content.Dialogs;
		this.Choices = content.Choices;
		this.ButtonOptions = buttonOptions;
		this.ChoiceIndex = null;
		this.DestroyBoxDelayed = false;
		this.Messages = new Array<DialogBox>();
		this.Scrolling = false;
	
		const settings: KineticScrollSettings = {
            kineticMovement: true,
            timeConstantScroll: 325,
            horizontalScroll: false,
            verticalScroll: true,
            bounds: {left: 0, top: 0, bottom: 0, right: 300}
        }
		this.KineticScroll = new KineticScroll(this.Env, settings);
		
		this.Env.input.on(
            'pointerdown',
            function (pointer) {
				if (this.Env.input.y < Config.Game.height - this.InputCamera.height) {
					this.Scrolling = true;
					this.KineticScroll.beginMove(pointer);
				}
            },
            this
        );
        this.Env.input.on(
            'pointerup', 
            function (pointer) {
				this.Scrolling = false;
                this.KineticScroll.endMove();
            },
            this);
        this.Env.input.on(
            'pointermove', 
            function (pointer) {
                this.KineticScroll.move(pointer);
            },
            this
        );

		this.InputFieldOptions.offsetY = -Config.Game.height * 2;
		this.initDialogBox();
	}

	preUpdate() {
		if (this.ChoiceIndex != null) {
			this.updateStarCount(this.Choices[this.ChoiceIndex].stars);
			this.InputField.removeButtons();

			let answer = this.Choices[this.ChoiceIndex].text
			let message = new DialogBox(this.Env, answer, this.Animate, Anchor.Top, this.AnswerOptions);
			this.AnswerOptions.offsetY += message.getHeight() + this.AnswerOptions.padding;
			this.MessageOptions.offsetY += message.getHeight() + this.AnswerOptions.padding;
			this.Env.add.existing(message);
			this.Messages.push(message);
			this.setCameraScroll(message);

			let nextDialog = this.Choices[this.ChoiceIndex].nextDialog;
			if (nextDialog == "") {
				this.destroy();
				return;
			}
			this.Env.time.addEvent({
				delay: Math.random() * 1000 + 500,
				callback: () => {
					this.showDialog(nextDialog);
				},
				callbackScope: this,
			})

			this.ChoiceIndex = null;
		} else if (this.DestroyBoxDelayed) {
			this.destroy();
		}

		if (this.KineticScroll){
			this.KineticScroll.update();
		}
	}

	destroy() {
		for (let i = 0; i < this.Messages.length; ++i) {
			this.Messages[i].destroy();
		}
		this.InputField.destroy();
		super.destroy();
	}

	private initDialogBox() {
		if (!this.Dialogs.hasOwnProperty('start')) {
			console.error('Error. There should be a Dialog with the key "start" in the Dialog Tree.');
		}

		this.AnswerOptions.cropRight = 0;
		this.AnswerOptions.cropLeft = 50;
		this.MessageOptions.cropRight = 50;
		this.MessageOptions.cropLeft = 0;
		this.AnswerOptions.offsetY = 0;
		this.MessageOptions.offsetY = 0;

		this.InputField = new DialogBox(this.Env, "", this.Animate, Anchor.Down, this.InputFieldOptions);
		this.InputCamera = this.Env.cameras.add(0, 0, Config.Game.width, Config.Game.height);
		this.InputCamera.setBackgroundColor(0xffffff);
		this.showDialog('start');
	}

	private showDialog(key: string) {
		if (!this.Dialogs.hasOwnProperty(key)) {
			console.error('Error. There is no Dialog with this id in the Tree');
		}

		let buttons = this.addButtons(this.Dialogs[key].linkedChoices);
		this.addButtonsCallbacks(key, buttons);
		this.Env.cameras.main.height = Config.Game.height - this.InputField.getHeight();
		this.InputCamera.height = this.InputField.getHeight();
		let pos = this.InputField.getPos();
		this.InputCamera.setPosition(0, Config.Game.height - this.InputCamera.height);
		this.InputCamera.setScroll(0, pos.y);

		let message = new DialogBox(this.Env, this.Dialogs[key].text, this.Animate, Anchor.Top, this.MessageOptions);
		this.AnswerOptions.offsetY += message.getHeight() + this.MessageOptions.padding;
		this.MessageOptions.offsetY += message.getHeight() + this.MessageOptions.padding;
		this.Env.add.existing(message);
		this.Messages.push(message);
		this.setCameraScroll(message);
	}

	private setCameraScroll(message: DialogBox) {
		let messageBottom = message.getPos().y + message.getHeight();
		this.KineticScroll.setBottom(messageBottom);
		let cameraBottom = this.Env.cameras.main.scrollY + this.Env.cameras.main.height;
		if (messageBottom > cameraBottom) {
			this.Env.cameras.main.scrollY += messageBottom - cameraBottom;
		}
	}

	private addButtons(choiceArray: Array<string>): Array<Phaser.GameObjects.Sprite> {
		let buttons = new Array<Phaser.GameObjects.Sprite>();
		let labels = this.getChoicesText(choiceArray);

		if (!labels.length || (labels.length == 1 && labels[0] === "")) {
			buttons.push(this.InputField.addArrowButton());
		} else {
			buttons = this.InputField.addButtons(labels, Orientation.Vertical, true, this.ButtonOptions);
		}
		return buttons;
	}

	private addButtonsCallbacks(dialogKey: string, buttons: Array<Phaser.GameObjects.Sprite>) {
		if (this.Dialogs[dialogKey].linkedChoices.length == 0) {
			buttons[0].on('pointerup', () => {
				if (!this.Scrolling)
					this.DestroyBoxDelayed = true;
			}, this);
		} else {
			for (let i = 0; i < buttons.length; ++i) {
				let choiceKey = this.Dialogs[dialogKey].linkedChoices[i];
				buttons[i].on('pointerup', () => {
					if (!this.Scrolling)
						this.ChoiceIndex = choiceKey;
				}, this);
			}
		}
	}

	private getChoicesText(choiceArray: Array<string>): Array<string> {
		let labelsArray = new Array<string>();
		for (let i = 0; i < choiceArray.length; ++i) {
			let label = this.Choices[choiceArray[i]].text;
			if (i > 0 && label === "")
				console.error('Error. There should not be an empty choice in a multiple choices dialog');
			labelsArray.push(label);
		}
		if (labelsArray[0] === "" && labelsArray.length > 1)
			console.error('Error. There should not be an empty choice in a multiple choices dialog');
		return labelsArray;
	}

	private updateStarCount(difference: number) {
		if (this.Env.registry.has('starCount')) {
			let stars: number = this.Env.registry.get('starCount');
			stars = Math.max(0, stars + difference);
			this.Env.registry.set('starCount', stars);
		} else {
			console.warn("The starCount value should be initialized in the registry before this call.");
		}
	}
}
