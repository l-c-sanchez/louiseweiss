define(["require", "exports", "./Config", "./GameText"], function (require, exports, Config_1, GameText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Anchor;
    (function (Anchor) {
        Anchor[Anchor["Top"] = 0] = "Top";
        Anchor[Anchor["Down"] = 1] = "Down";
        Anchor[Anchor["Center"] = 2] = "Center";
    })(Anchor = exports.Anchor || (exports.Anchor = {}));
    var Dialog = /** @class */ (function () {
        function Dialog(env, text, animate, anchor, height) {
            this.Visible = true;
            this.EventCounter = 0;
            this.TextCounter = 0;
            this.TimedEvent = null;
            this.Env = env;
            this.Text = text;
            this.Anchor = anchor;
            this.Animate = animate;
            this.Options = {
                borderThickness: 3,
                borderColor: 0xfeb809,
                borderAlpha: 1,
                windowAlpha: 1,
                windowColor: 0x303030,
                windowHeight: 150,
                padding: 32,
                dialogSpeed: 3
            };
            if (height !== undefined) {
                this.Options.windowHeight = height;
            }
            var y = Config_1.Config.Game.height - this.Options.windowHeight - this.Options.padding + 10;
            if (this.Anchor == Anchor.Top) {
                y = this.Options.padding + 10;
            }
            else if (this.Anchor == Anchor.Center) {
                y = Config_1.Config.Game.centerY - this.Options.windowHeight * 0.5 - this.Options.padding + 10;
            }
            this.TextPos = new Phaser.Math.Vector2(this.Options.padding + 10, y);
            this.createWindow();
            this.CurrentText = new GameText_1.GameText(this.Env, this.TextPos.x, this.TextPos.y, "");
            this.CurrentText.setWordWrap(Config_1.Config.Game.width - this.Options.padding * 2 - 25);
            this.CurrentText.setAlign('left');
            this.showNextText();
            this.Env.input.on('pointerup', this.onPointerUp, this);
        }
        Dialog.prototype.createWindow = function () {
            var x = this.Options.padding;
            var y = Config_1.Config.Game.height - this.Options.windowHeight - this.Options.padding;
            if (this.Anchor == Anchor.Top) {
                y = this.Options.padding;
            }
            else if (this.Anchor == Anchor.Center) {
                y = Config_1.Config.Game.centerY - this.Options.windowHeight * 0.5 - this.Options.padding;
            }
            var width = Config_1.Config.Game.width - this.Options.padding * 2;
            var height = this.Options.windowHeight;
            this.Graphics = this.Env.add.graphics();
            this.createOuterWindow(x, y, width, height);
            this.createInnerWindow(x, y, width, height);
        };
        Dialog.prototype.createInnerWindow = function (x, y, width, height) {
            this.Graphics.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
            this.Graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
        };
        Dialog.prototype.createOuterWindow = function (x, y, width, height) {
            this.Graphics.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
            this.Graphics.strokeRect(x, y, width, height);
        };
        Dialog.prototype.showNextText = function () {
            if (this.TextCounter < this.Text.length) {
                this.EventCounter = 0;
                this.Dialog = this.Text[this.TextCounter].split('');
                this.CurrentText.setText(this.Animate ? '' : this.Text[this.TextCounter]);
                if (this.TimedEvent !== null) {
                    this.TimedEvent.remove(function () { });
                    this.TimedEvent = null;
                }
                console.log("here");
                this.TimedEvent = this.Env.time.addEvent({
                    delay: 150 - (this.Options.dialogSpeed * 30),
                    callback: this.animateText,
                    callbackScope: this,
                    loop: true
                });
                ++this.TextCounter;
                return true;
            }
            return false;
        };
        Dialog.prototype.animateText = function () {
            if (this.TimedEvent === null)
                return;
            ++this.EventCounter;
            console.log(this.CurrentText.PhaserText.text + this.Dialog[this.EventCounter - 1]);
            this.CurrentText.setText(this.CurrentText.PhaserText.text + this.Dialog[this.EventCounter - 1]);
            if (this.EventCounter === this.Dialog.length) {
                this.TimedEvent.remove(function () { });
                this.TimedEvent = null;
            }
        };
        Dialog.prototype.onPointerUp = function () {
            if (this.TimedEvent === null) {
                this.showNextText();
            }
            else {
                this.CurrentText.setText(this.Text[this.TextCounter - 1]);
                this.TimedEvent.remove(function () { });
                this.TimedEvent = null;
            }
        };
        return Dialog;
    }());
    exports.Dialog = Dialog;
});
//# sourceMappingURL=Dialog.js.map