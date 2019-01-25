/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2018 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

var Random = require('../geom/line/Random');

/**
 * Takes an array of Game Objects and positions them at random locations on the Line.
 * 
 * If you wish to pass a `Phaser.GameObjects.Line` Shape to this function, you should pass its `geom` property.
 *
 * @function Phaser.Actions.RandomLine
 * @since 3.0.0
 *
 * @generic {Phaser.GameObjects.GameObject[]} G - [items,$return]
 *
 * @param {(array|Phaser.GameObjects.GameObject[])} items - An array of Game Objects. The contents of this array are updated by this Action.
 * @param {Phaser.Geom.Line} line - The Line to position the Game Objects randomly on.
 *
 * @return {(array|Phaser.GameObjects.GameObject[])} The array of Game Objects that was passed to this Action.
 */
var RandomLine = function (items, line)
{
    for (var i = 0; i < items.length; i++)
    {
        Random(line, items[i]);
    }

    return items;
};

module.exports = RandomLine;
