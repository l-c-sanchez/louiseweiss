import { DialogBox, Anchor, DialogOptions, Orientation } from "./DialogBox";

interface Choice {
	text: string;
	stars: number;
	nextDialog: string;
}

interface Dialog {
	text: string;
	linkedChoices: Array<string>;
	// isFinal: boolean;
}

interface DialogObj {
	[key: string]: Dialog;
}

interface ChoiceObj {
	[key: string]: Choice;
}

interface DialogTreeObj {
	Choices: ChoiceObj;
	Dialogs: DialogObj;
}

export class DialogTree extends Phaser.GameObjects.GameObject {

	private Env					: Phaser.Scene;
	private Dialogs				: DialogObj;
	private Choices				: ChoiceObj;
	public Box					: DialogBox;
	private ChoiceIndex			: string;
	private DestroyBoxDelayed	: boolean;

	constructor(env: Phaser.Scene, content: DialogTreeObj, animate: boolean, anchor: Anchor, options?: DialogOptions) {
		super(env, 'DialogTree');
		this.Env = env;
		this.Dialogs = content.Dialogs;
		this.Choices = content.Choices;
		this.ChoiceIndex = null;
		this.DestroyBoxDelayed = false;
	
		this.initDialogBox(animate, anchor, options);
	}

	preUpdate() {
		if (this.ChoiceIndex != null) {
			this.updateStarCount(this.Choices[this.ChoiceIndex].stars);
			this.Box.removeButtons();
			this.showDialog(this.Choices[this.ChoiceIndex].nextDialog);
			this.ChoiceIndex = null;
		} else if (this.DestroyBoxDelayed) {
			this.destroy();
		}
	}

	destroy() {
		this.Box.destroy();
		super.destroy();
	}

	private initDialogBox(animate: boolean, anchor: Anchor, options?: DialogOptions) {
		if (!this.Dialogs.hasOwnProperty('start')) {
			console.error('Error. There should be a Dialog with the key "start" in the Dialog Tree.');
		}

		this.Box = new DialogBox(this.Env, "", animate, anchor, options);
		this.Env.add.existing(this.Box);
		this.showDialog('start');
	}

	private showDialog(key: string) {
		if (!this.Dialogs.hasOwnProperty(key)) {
			console.error('Error. There is no Dialog with this id in the Tree');
		}

		this.Box.setText(this.Dialogs[key].text);
		let buttons = this.addButtons(this.Dialogs[key].linkedChoices);
		this.addButtonsCallbacks(key, buttons);
	}

	private addButtons(choiceArray: Array<string>): Array<Phaser.GameObjects.Sprite> {
		let buttons = new Array<Phaser.GameObjects.Sprite>();
		let labels = this.getChoicesText(choiceArray);

		if (!labels.length || (labels.length == 1 && labels[0] === "")) {
			buttons.push(this.Box.addArrowButton());
		} else {
			buttons = this.Box.addButtons(labels, Orientation.Vertical, true);
		}
		return buttons;
	}

	private addButtonsCallbacks(dialogKey: string, buttons: Array<Phaser.GameObjects.Sprite>) {
		if (this.Dialogs[dialogKey].linkedChoices.length == 0) {
			buttons[0].on('pointerup', () => {
				this.DestroyBoxDelayed = true;
			}, this);
		} else {
			for (let i = 0; i < buttons.length; ++i) {
				let choiceKey = this.Dialogs[dialogKey].linkedChoices[i];
				buttons[i].on('pointerup', () => {
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
