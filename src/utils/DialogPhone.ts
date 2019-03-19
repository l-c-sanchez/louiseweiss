import { DialogBox, Anchor, DialogOptions, Orientation } from "./DialogBox";
import { DialogObj, ChoiceObj, DialogTreeObj } from "./DialogTree";
import { Config } from "../Config";

export class DialogPhone extends Phaser.GameObjects.GameObject {

	private Env					: Phaser.Scene;
	private Animate				: boolean;
	private Options				: DialogOptions;
	private InputFieldOptions	: DialogOptions;

	private Dialogs				: DialogObj;
	private Choices				: ChoiceObj;
	private Messages			: Array<DialogBox>;
	private InputField			: DialogBox;
	private ChoiceIndex			: string;
	private DestroyBoxDelayed	: boolean;

	constructor(env: Phaser.Scene, content: DialogTreeObj, animate: boolean, options?: DialogOptions) {
		super(env, 'DialogPhone');
		this.Env = env;
		this.Animate = animate;
		this.Options = options;
		this.InputFieldOptions = {};
		Object.assign(this.InputFieldOptions, options);
		this.Dialogs = content.Dialogs;
		this.Choices = content.Choices;
		this.ChoiceIndex = null;
		this.DestroyBoxDelayed = false;
		this.Messages = new Array<DialogBox>();
	
		this.Options.offsetY = 0;

		this.initDialogBox();
	}

	preUpdate() {
		if (this.ChoiceIndex != null) {
			this.updateStarCount(this.Choices[this.ChoiceIndex].stars);
			this.InputField.removeButtons();
			this.showDialog(this.Choices[this.ChoiceIndex].nextDialog);

			let answer = this.Choices[this.ChoiceIndex].text
			let message = new DialogBox(this.Env, answer, this.Animate, Anchor.Top, this.Options);
			this.Options.offsetY += message.getHeight();
			this.Env.add.existing(message);
			this.Messages.push(message);

			this.ChoiceIndex = null;
		} else if (this.DestroyBoxDelayed) {
			this.destroy();
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

		this.InputField = new DialogBox(this.Env, "", this.Animate, Anchor.Down, this.InputFieldOptions);
		this.showDialog('start');
	}

	private showDialog(key: string) {
		if (!this.Dialogs.hasOwnProperty(key)) {
			console.error('Error. There is no Dialog with this id in the Tree');
		}

		let message = new DialogBox(this.Env, this.Dialogs[key].text, this.Animate, Anchor.Top, this.Options);
		this.Options.offsetY += message.getHeight();
		console.log(message.getHeight(), this.Options.offsetY);
		this.Env.add.existing(message);
		this.Messages.push(message);

		let buttons = this.addButtons(this.Dialogs[key].linkedChoices);
		this.addButtonsCallbacks(key, buttons);
	}

	private addButtons(choiceArray: Array<string>): Array<Phaser.GameObjects.Sprite> {
		let buttons = new Array<Phaser.GameObjects.Sprite>();
		let labels = this.getChoicesText(choiceArray);

		if (!labels.length || (labels.length == 1 && labels[0] === "")) {
			buttons.push(this.InputField.addArrowButton());
		} else {
			buttons = this.InputField.addButtons(labels, Orientation.Vertical, true);
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
